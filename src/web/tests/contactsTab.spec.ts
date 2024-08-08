import { test, expect } from '@playwright/test';
import { createContactWithRequiredValidations, fuzzySearchContact, createContact, updateContact, importContacts, checkPagination } from '../pages/contacts';
import { login, goToContacts, goToDashboard } from '../pages/common';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const csvFilePath = 'src/web/data/sample.csv';
// Function to read contacts from the JSON file
function getContacts() {
  const data = fs.readFileSync('src/web/data/contacts/contacts.json', 'utf8');
  return JSON.parse(data);
}

// Function to get a random contact from the array
function getRandomContact(contacts: any[]) {
  const randomIndex = Math.floor(Math.random() * contacts.length);
  return contacts[randomIndex];
}

test.describe('Contacts Page Tests', () => {
  // Access the credentials from environment variables
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  // Ensure email and password are defined
  if (!email || !password) {
    throw new Error('Email and password must be defined in .env file');
  }

  // Before each test, navigate to the contacts page
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);
    await login(page, email, password);
    await goToContacts(page);
  });

  test('should create multiple contacts', async ({ page }) => {
    const contacts = getContacts();
    for (const contact of contacts) {
      await createContact(page, contact.firstName, contact.lastName, contact.phone, contact.email, contact.tag);
    }
  });

  test('should update an existing contact', async ({ page }) => {
    const contacts = getContacts();
    const randomContact = getRandomContact(contacts);
    await updateContact(page, 'Ross', 'NewRoss', 'NewGeller', '+1 234-567-8901', 'new@gmail.com')
  });

  test('should (fuzzy) search a new/existing contact', async ({ page }) => {
    const contacts = getContacts();
    const contact = contacts.find((contact: { firstName: string; lastName: string }) =>
      `${contact.firstName} ${contact.lastName}` === 'Joey Tribbiani'
    );
    if (contact) {
      await fuzzySearchContact(page, `${contact.firstName} ${contact.lastName}`, contact.phone , contact.email, contact.tag);
    } else {
      console.error('Contact not found in contacts.json');
    }
  });

  test('should import contacts via csv', async ({ page }) => {
    await importContacts(page, csvFilePath)
    const contacts = getContacts();
    const contact = contacts.find((contact: { firstName: string; lastName: string }) =>
      `${contact.firstName} ${contact.lastName}` === 'Claire Dunphy'
    );
    if (contact) {
      await fuzzySearchContact(page, `${contact.firstName} ${contact.lastName}`, contact.phone , contact.email, contact.tag);
    } else {
      console.error('Contact not found in contacts.json');
    }
  });

  test('should be able to navigate through contacts with pagination', async ({ page }) => {
    await checkPagination(page);
  });
});
