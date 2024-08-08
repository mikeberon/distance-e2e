import { expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import { baseUrl } from '../../../playwright.config'

// Load environment variables from .env file
dotenv.config();

export async function login(page: Page, email: string, password: string) {
  try {
    await page.getByRole('link', { name: 'Already have an account? Log' }).click();
    await expect(page).toHaveURL(`${baseUrl}/login`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    // Verify that landing page after login is /inbox
    await expect(page).toHaveURL(`${baseUrl}/inbox`);
    await page.getByText('Sendera').isVisible();
    console.log('Successfully logged in');
  } catch (error) {
    console.error('Error logging in', error);
    throw error;
  }
}

export async function goToContacts(page: Page) {
    await page.getByRole('button', { name: 'Contacts' }).isVisible();
    await page.getByRole('button', { name: 'Contacts' }).click();
}

export async function goToDashboard(page: Page) {
    await page.getByText('Sendera').isVisible();
    await page.getByText('Sendera').click();
}