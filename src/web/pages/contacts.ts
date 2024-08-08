import { expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Function to generate a random 10-digit phone number
function getRandomPhoneNumber(): string {
  let phoneNumber = '555'; // Example: starting with a common area code
  for (let i = 0; i < 7; i++) {
    phoneNumber += Math.floor(Math.random() * 10).toString();
  }
  return phoneNumber;
}

async function clickCreateContactButton(page: Page) {
  let createContactButton = await page.getByRole('button', { name: 'Create contact' });
  await page.waitForTimeout(3000);
  await createContactButton.isEnabled();
  await createContactButton.click();
}

async function fillContactFields(page: Page, firstName: string, lastName: string, phone: string, email: string, tag: string) {
  await page.getByLabel('First name').fill(firstName);
  await page.getByLabel('Last name').fill(lastName);
  await page.getByLabel('Phone number').fill(phone);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Create contact').getByText(tag).click();
  console.log(`Adding ${firstName} ${lastName} as a contact`);
}

async function clickSaveButton(page: Page) {
  let saveButton = await page.getByRole('button', { name: 'Continue' });
  await saveButton.click();
  console.log("Clicked 'Continue' button successfully.");
}

async function assertSuccessMessage(page: Page) {
  await expect(page.getByText('Successfully created contact.', { exact: true })).toBeVisible();
}

async function assertRequiredValidations(page: Page) {
  const requiredFieldMessages = ['This field is required', 'This field is required'];
  for (let i = 0; i < requiredFieldMessages.length; i++) {
    await expect(page.getByText(requiredFieldMessages[i]).nth(i)).toBeVisible();
    console.log(`Required validation for field ${i + 1} is displayed`);
  }
}

export async function createContact(page: Page, firstName: string, lastName: string, phone: string, email: string, tag: string) {
  // const phone = getRandomPhoneNumber();

  try {
    await page.pause();
    // Click 'Create contact' button
    await clickCreateContactButton(page);

    // Fill out contact fields
    await fillContactFields(page, firstName, lastName, phone, email, tag);

    // Click 'Save' button to save the contact
    await clickSaveButton(page);

    // Assert the toast message for successful contact creation
    await assertSuccessMessage(page);

    console.log(`${firstName} ${lastName} was successfully added as a contact`);
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error; // Propagate the error up if needed
  }
}

export async function createContactWithRequiredValidations(page: Page, firstName: string, lastName: string, phone: string, email: string, tag: string) {
  // const phone = getRandomPhoneNumber();

  try {
    // Click 'Create contact' button
    await clickCreateContactButton(page);

    // Click save button to trigger required fields error messages
    await clickSaveButton(page);

    // Check for required field validations
    await assertRequiredValidations(page);

    // Fill out contact fields
    await fillContactFields(page, firstName, lastName, phone, email, tag);

    // Click 'Save' button again to save the contact
    await clickSaveButton(page);

    // Assert the toast message for successful contact creation
    await assertSuccessMessage(page);

    console.log(`${firstName} ${lastName} was successfully added as a contact`);
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error; // Propagate the error up if needed
  }
}

export async function fuzzySearchContact(page: Page, firstName: string, phone: string, email: string, tags: string) {
  let hasFailed = false;

  // Helper function to perform search and check visibility
  async function performSearchAndCheck(fieldValue: string, fieldName: string) {
    try {
      await searchViaField(page, fieldValue);
      await expect(page.getByText('Joey Tribbiani')).toBeVisible({ timeout: 5000 });
      console.log(`Contact was successfully searched using ${fieldName}: ${fieldValue}`);
    } catch (error) {
      console.error(`Error searching contact using ${fieldName}:`, error);
      hasFailed = true;
    } finally {
      try {
        await page.getByPlaceholder('Search...').fill('');
      } catch (error) {
        console.error(`Error clearing search field after ${fieldName}:`, error);
      }
    }
  }

  const searchCriteria = [
    { value: firstName, name: 'First name' },
    { value: phone, name: 'Phone' },
    { value: email, name: 'Email' },
    // Logic ready but search via tags are not working right now
    { value: tags, name: 'Tags' }
  ];

  for (const criterion of searchCriteria) {
    await performSearchAndCheck(criterion.value, criterion.name);
  }

  if (hasFailed) {
    throw new Error('One or more search criteria failed.');
  }
}

async function searchViaField(page: Page, value: string) {
  try {
    await page.getByRole('button', { name: 'Create contact' }).isEnabled();
    await page.locator('div').filter({ hasText: /^Import contactsCreate contact$/ }).getByRole('img').first().click();
    await page.getByPlaceholder('Search...').fill(value);
  } catch (error) {
    console.error('Error during search via field:', error);
    throw error; // Rethrow the error to be caught by performSearchAndCheck
  }
}

// Function to read contacts from the JSON file
function getContacts() {
  const data = fs.readFileSync('src/web/data/contacts/contacts.json', 'utf8');
  return JSON.parse(data);
}

export async function updateContact(page: Page, searchCriteria: string, newFirstName: string, newLastName: string, newPhone: string, newEmail: string) {
  const contacts = getContacts();
  const contact = contacts.find((contact: { firstName: string; lastName: string }) =>
    `${contact.firstName} ${contact.lastName}` === 'Ross Geller'
  );
  await searchViaField(page, searchCriteria);
  await page.getByText(`${contact.firstName} ${contact.lastName}`).click();
  await editContactFields(page, newFirstName, newLastName, newPhone, newEmail);
  try {
    await expect(page.getByText('New' + `${contact.firstName}` + ' New' + `${contact.lastName}`)).toBeVisible();
    await expect(page.getByText(newPhone)).toBeVisible();
    await expect(page.getByText(newEmail)).toBeVisible();
  } catch (error) {
    console.error('Some details were not updated properly', error);
    throw error; // Rethrow the error to be caught by performSearchAndCheck
  }
  await expect(page.getByText('Profile')).toBeVisible();
  await page.reload();

  // Revert function here
  await searchViaField(page, 'New' + `${contact.firstName}`);
  await page.getByText('New' + `${contact.firstName}` + ' New' + `${contact.lastName}`).click();
  await editContactFields(page, contact.firstName, contact.lastName, contact.phone, contact.email);

  try {
    await expect(page.getByText(`${contact.firstName} ${contact.lastName}`)).toBeVisible();
    await expect(page.getByText(contact.phone)).toBeVisible();
    await expect(page.getByText(contact.email)).toBeVisible();
  } catch (error) {
    console.error('Some details were not updated properly', error);
    throw error; // Rethrow the error to be caught by performSearchAndCheck
  }
  await expect(page.getByText('Profile')).toBeVisible();
  await page.reload();

}

async function editContactFields(page: Page, newFirstName: string, newLastName: string, newPhone: string, newEmail: string) {
  try {
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('First name').fill(newFirstName);
    await page.getByLabel('Last name').fill(newLastName);
    await page.getByLabel('Phone number').fill(newPhone);
    await page.getByLabel('Email').fill(newEmail);
    await page.getByRole('button', { name: 'Save' }).click();
  } catch (error) {
    console.error('Error during updating the contact details:', error);
    throw error; // Rethrow the error to be caught by performSearchAndCheck
  }
}

// Function to import contacts
export async function importContacts(page: Page, filePath: string) {
  try {
    await page.pause(); // Optional: Pause for debugging

    // Click 'Import contacts' button
    await expect(page.getByText(`Import contacts`)).toBeVisible();
    await page.getByText(`Import contacts`).click();

    // Click 'Upload' button
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
    await page.getByRole('button', { name: 'Upload' }).click();

    // Upload the CSV file
    await page.setInputFiles('input[type="file"]', filePath);

    // Click the "All Leads have opted-in to receiving email communications*" checkbox
    await page.getByLabel('All Leads have opted-in to').click();

    // Click 'Continue' button
    await page.getByText(`Continue`).click();


    await page.getByLabel('Update existing contacts').click();
    await page.getByText(`Continue`).click();

    // Validate that the CSV was uploaded successfully
    await expect(page.getByText('Your import is in progress...')).toBeVisible();

    console.log('CSV file was uploaded successfully.');
  } catch (error) {
    console.error('Error importing contacts:', error);
    throw error; // Propagate the error if needed
  }
}

export async function checkPagination(page: Page) {
  const contacts = getContacts();
  const contact = contacts.find((contact: { firstName: string; lastName: string }) =>
    `${contact.firstName} ${contact.lastName}` === 'Ross Geller'
  );

  if (!contact) {
    throw new Error('Contact Ross Geller not found in the contacts list');
  }

  while (true) {
    try {
      // Check if the contact is visible on the current page
      if (await page.isVisible(`text=${contact.firstName} ${contact.lastName}`)) {
        console.log(`Contact ${contact.firstName} ${contact.lastName} found`);
        break;
      }

      // Click the "Next" button to go to the next page
      await page.click('text=Next');
    } catch (error) {
      console.error('Some details were not updated properly', error);
      throw error;
    }

    // Optionally add a delay between clicks to avoid hitting rate limits or causing issues
    await page.waitForTimeout(1000);
  }
}