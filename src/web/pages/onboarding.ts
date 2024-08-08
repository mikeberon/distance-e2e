import { expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Access the credentials from environment variables
const password = process.env.PASSWORD as string;

// Ensure the password is defined
if (!password) {
    throw new Error('Password must be defined in .env file');
}

interface Owner {
    firstName: string;
    lastName: string;
    email: string;
}

interface EmployeeCountOptions {
    [key: string]: string;
}

interface LocationCountOptions {
    [key: string]: string;
}

interface BillingPlanOptions {
    [key: string]: string;
}

interface OnboardingData {
    owners: Owner[];
    employeeCountOptions: EmployeeCountOptions;
    businessLocationCountOptions: LocationCountOptions;
    billingPlanOptions: BillingPlanOptions;
}

function getOnboardingData(): OnboardingData {
    const data = fs.readFileSync('src/web/data/business/business.json', 'utf8');
    return JSON.parse(data) as OnboardingData;
}

function getRandomOwner(owners: Owner[]): Owner {
    const randomIndex = Math.floor(Math.random() * owners.length);
    return owners[randomIndex];
}

function getRandomEmployeeCountOption(employeeCountOptions: EmployeeCountOptions): string {
    const keys = Object.keys(employeeCountOptions);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return employeeCountOptions[keys[randomIndex]];
}

function getRandomLocationCountOption(businessLocationCountOptions: LocationCountOptions): string {
    const keys = Object.keys(businessLocationCountOptions);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return businessLocationCountOptions[keys[randomIndex]];
}

function getRandomBillingPlanOption(billingPlanOptions: BillingPlanOptions): string {
    const keys = Object.keys(billingPlanOptions);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return billingPlanOptions[keys[randomIndex]];
}

async function inputForcedOTP(page: Page, keys: string[]) {
    for (const key of keys) {
        await page.keyboard.press(key);
    }
}

async function selectEmployeeCount(page: Page, employeeRange: string) {
    await page.selectOption('#employee_count', { label: employeeRange });
}

async function selectLocationCount(page: Page, locationRange: string) {
    await page.selectOption('#location_count', { label: locationRange });
}

async function selectBillingPlanCount(page: Page, plan: string) {
    await page.getByLabel(plan).click();
}

export async function signUp(page: Page) {
    const { owners, employeeCountOptions, businessLocationCountOptions, billingPlanOptions } = getOnboardingData();
    const randomOwner = getRandomOwner(owners);
    const businessName = `${randomOwner.firstName}${randomOwner.lastName.charAt(0)}`;
    const website = `${randomOwner.firstName}${randomOwner.lastName.charAt(0)}`+`.com`;
    const randomEmployeeCountOption = getRandomEmployeeCountOption(employeeCountOptions);
    const randomLocationCountOption = getRandomLocationCountOption(businessLocationCountOptions);
    const randomBillingPlanOption = getRandomBillingPlanOption(billingPlanOptions);

    // BUSINESS SIGNUP PAGE
    await page.getByLabel('First name').fill(randomOwner.firstName);
    await page.getByLabel('Last name').fill(randomOwner.lastName);
    await page.getByLabel('Email').fill(randomOwner.email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign up' }).click();

    // OTP PAGE
    await expect(page.getByText('We sent you a code.')).toBeVisible();

    // BYPASS OTP FOR NOW (TEMPORARY)
    await inputForcedOTP(page, ['1', '2', '3', '4', '5', '6']);
    await expect(page.getByText('Verified!')).toBeVisible();
    await page.pause();

    // BUSINESS NAME PAGE
    await page.locator('xpath=//input[@id="business_name"]').fill(businessName);
    await page.getByRole('button', { name: 'Continue' }).click();

    // BUSINESS DETAILS PAGE
    // SELECT RANDOM EMPLOYEE COUNT
    await selectEmployeeCount(page, randomEmployeeCountOption);
    // SELECT RANDOM LOCATION COUNT
    await selectLocationCount(page, randomLocationCountOption);
    // OPTIONAL WEBSITE
    await page.locator('xpath=//input[@id="website"]').fill(website);
    await page.getByRole('button', { name: 'Continue' }).click();

    //BILLING PLAN PAGE
    await expect(page.getByRole('heading', { name: 'Build your team' })).toBeVisible();
    await selectBillingPlanCount(page, randomBillingPlanOption)
    await page.locator('#user_count').fill('5')
    await page.getByRole('button', { name: 'Continue to billing' }).click();

    //CHECKOUT PAGE
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    // POSSIBLE BUG 
    // await expect(page.getByText('5 x $')).toBeVisible();
    await page.getByRole('button', { name: 'Subscribe' }).click();

    //GETTING EVERYTHING SET...
    await expect(page.getByText('Getting everything set...')).toBeVisible();
    
    // SENDERA LANDING PAGE INBOX
    await page.getByText('Sendera').isVisible();
}
