const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const { loadContact, findContact, saveContact, checkDuplicate, updateContact, deleteContact } = require('./utils/contact');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser('secret'));

app.use(session({
  cookie: {
    maxAge: 6000
  },
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

// Homepage
app.get('/', (req, res) => {
  res.render('index', {
    layout: 'layouts/main',
    title: 'Homepage',
  });
});

// About
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main',
    title: 'About'
  });
});

// Contact
app.get('/contact', (req, res) => {
  const contacts = loadContact();

  res.render('contact', {
    layout: 'layouts/main',
    title: 'Contact',
    contacts: contacts,
    message: req.flash('message')
  });
});

// Add
app.get('/contact/add', (req, res) => {
  res.render('add', {
    layout: 'layouts/main',
    title: 'Add Contact',
    id: loadContact().length + 1
  });
});

app.post('/contact', [
  check('email', 'Invalid email').isEmail(),
  check('number', 'Invalid number format').isMobilePhone('id-ID'),
  body('number').custom(value => {
    const isDuplicate = checkDuplicate(value);
    if (isDuplicate) throw new Error('Contact already exists');
    return true;
  })
], (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    saveContact(req.body);
    req.flash('message', 'Contact added');
    res.redirect('/contact');
  } else {
    res.render('add', {
      layout: 'layouts/main',
      title: 'Add Contact',
      id: loadContact().length + 1,
      errors: errors.array()
    });
  }
});

// Delete
app.get('/contact/delete/:id', (req, res) => {
  const contact = findContact(req.params.id);

  if (contact) {
    deleteContact(req.params.id);
    req.flash('message', 'Contact deleted');
    res.redirect('/contact');
  } else {
    res.status(404);
    res.send('404 Not Found');
  }
});

// Edit
app.get('/contact/edit/:id', (req, res) => {
  const contact = findContact(req.params.id);

  res.render('edit', {
    layout: 'layouts/main',
    title: 'Edit Contact',
    contact: contact
  });
});

app.post('/contact/update', [
  check('email', 'Invalid email').isEmail(),
  check('number', 'Invalid number format').isMobilePhone('id-ID'),
  body('number').custom((value, { req }) => {
    const isDuplicate = checkDuplicate(value);

    if (value !== req.body.oldNumber && isDuplicate) {
      throw new Error('Contact already exists');
    }

    return true;
  })
], (req, res) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    updateContact(req.body, req.body.id);
    req.flash('message', 'Contact updated');
    res.redirect('/contact');
  } else {
    res.render('edit', {
      layout: 'layouts/main',
      title: 'Edit Contact',
      errors: errors.array(),
      contact: req.body
    });
  }
});

// Detail
app.get('/contact/:id', (req, res) => {
  const contact = findContact(req.params.id);

  res.render('detail', {
    layout: 'layouts/main',
    title: 'Contact Detail',
    contact: contact
  });
});

// Page that doesn't exist
app.use('/', (req, res) => {
  res.status(404);
  res.send('404 Not Found');
});

// Server
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});