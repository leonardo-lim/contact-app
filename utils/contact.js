const fs = require('fs');

const directoryPath = './data';

if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
}

const dataPath = './data/contact.json';

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
}

function loadContact() {
  const file = fs.readFileSync('data/contact.json', 'utf-8');
  const contacts = JSON.parse(file);
  return contacts;
}

function findContact(id) {
  const contacts = loadContact();
  const contact = contacts.find(contact => contact.id === id);
  return contact;
}

function saveContact(contact) {
  const contacts = loadContact();
  contacts.push(contact);
  fs.writeFileSync('data/contact.json', JSON.stringify(contacts, null, 2));
}

function checkDuplicate(number) {
  const contacts = loadContact();
  const contact = contacts.find(contact => contact.number === number);
  return contact;
}

function updateContact(contact, id) {
  const contacts = loadContact();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  delete contact.oldNumber;
  contacts[contactIndex] = contact;
  fs.writeFileSync('data/contact.json', JSON.stringify(contacts, null, 2));
}

function deleteContact(id) {
  const contacts = loadContact();
  const contactIndex = contacts.findIndex(contact => contact.id === id);
  contacts.splice(contactIndex, 1);
  fs.writeFileSync('data/contact.json', JSON.stringify(contacts, null, 2));
}

module.exports = { loadContact, findContact, saveContact, checkDuplicate, updateContact, deleteContact };