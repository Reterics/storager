import { test } from '@playwright/test';

const baseURL = 'http://localhost:5173/'
const adminEmail = 'test@test.com'
const shopList = ["Teszt Bolt 1", "Teszt Bolt 2", "Teszt Bolt 3"]
const emailList = ["testbolt_1@test.com", "testbolt_2@test.com", "testbolt_3@test.com"]

export const login = async (page, email: string) => {
    if (page.url().endsWith("/signin") || page.url() === baseURL) {
        await page.getByRole('textbox', { name: 'Your email' }).waitFor();
        await page.getByRole('textbox', { name: 'Your email' }).click();
        await page.getByRole('textbox', { name: 'Your email' }).fill(email);
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill(email);
        await page.getByRole('button', { name: 'Sign in' }).click();
    }
}

export const logout = async (page) => {
    await page.getByTestId('userMenuButton').waitFor();
    await page.getByTestId('userMenuButton').click();
    await page.getByRole('button', { name: 'Logout' }).click();
}

export const createShops = async (page) => {
    for (const shop of shopList) {
        await page.waitForTimeout(5000);
        const elementCount = await page.locator('td:has-text("'+shop+'")').count();
        if (elementCount) {
            continue;
        }
        await page.locator('.main-container > div > div > .flex > .text-gray-900').click();
        await page.getByRole('textbox', { name: 'Name' }).waitFor();
        await page.getByRole('textbox', { name: 'Name' }).click();
        await page.getByRole('textbox', { name: 'Name' }).fill(shop);
        await page.getByRole('textbox', { name: 'Phone' }).click();
        await page.getByRole('textbox', { name: 'Phone' }).fill('0630666666');
        await page.getByRole('button', { name: 'Save' }).click();
    }
}

export const createUsers = async (page) => {
    const currentUrl = await page.url();
    if (!currentUrl.endsWith('?page=users')) {
        await page.getByTestId('userMenuButton').waitFor();
        await page.getByTestId('userMenuButton').click();
        await page.getByRole('link', { name: 'Users' }).click();
    }
    for (let i = 0; i < emailList.length; i++){
        const email = emailList[i];
        const assignedShop = shopList[i];
        const elementCount = await page.locator('role=cell[name="'+email+'"]').count();
        if (elementCount) {
            continue;
        }
        await page.getByTestId('addButton').click();

        await page.getByRole('textbox', { name: 'Username' }).waitFor();
        await page.getByRole('textbox', { name: 'Username' }).click();
        await page.getByRole('textbox', { name: 'Username' }).fill(email);
        await page.getByRole('textbox', { name: 'Email' }).click();
        await page.getByRole('textbox', { name: 'Email' }).fill(email);
        await page.getByRole('textbox', { name: 'Password', exact: true }).click();
        await page.getByRole('textbox', { name: 'Password', exact: true }).fill(email);
        await page.getByRole('textbox', { name: 'Password Confirmation' }).click();
        await page.getByRole('textbox', { name: 'Password Confirmation' }).fill(email);
        await page.getByRole('checkbox', { name: assignedShop }).check();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.waitForTimeout(1000);

        await logout(page);

        await login(page, adminEmail);

        await page.getByTestId('userMenuButton').waitFor();
        await page.getByTestId('userMenuButton').click();
        await page.getByRole('link', { name: 'Users' }).click();
    }
}

test('test', async ({ page }) => {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await login(page, adminEmail);
    await page.waitForTimeout(1000);
    await createShops(page);
    await createUsers(page);

    await logout(page);


    for (let i = 0; i < emailList.length; i++){
        const email = emailList[i];
        const assignedShop = shopList[i];
        await login(page, email);

        if (!page.getByRole('link', { name: 'Parts' })) {
            await page.getByRole('cell', { name: assignedShop }).waitFor();
            await page.getByRole('cell', { name: assignedShop }).click();
            await page.getByRole('link', { name: 'Parts' }).click();
        }

        if (!page.url().endsWith('?page=parts')) {
            await page.getByRole('link', { name: 'Parts' }).waitFor();
            await page.getByRole('link', { name: 'Parts' }).click();
        }

        const buttons = page.locator('tr .inline-flex > button:nth-child(2)');
        const count = await buttons.count();
        for (let i = count - 1; i >= 0; i--) {
            page.once('dialog', async function(dialog) {
                await dialog.accept();
            });
            await buttons.nth(i).click();
        }

        for (let y = 0; y < new Array(2).fill(null).length; y++){
            if (!await page.getByText('CKK-' + i + '-' + y).count()) {
                await page.getByTestId('addButton').click();
                await page.getByRole('textbox', { name: 'SKU' }).click();
                await page.getByRole('textbox', { name: 'SKU' }).fill('CKK-'+i+'-' + y);
                await page.getByRole('textbox', { name: 'Name' }).click();
                await page.getByRole('textbox', { name: 'Name' }).fill('Test '+i+'-' + y);
                await page.getByRole('textbox', { name: 'Description' }).click();
                await page.getByRole('textbox', { name: 'Description' }).fill('Desc');
                await page.getByRole('spinbutton', { name: 'Storage', exact: true }).click();
                await page.getByRole('spinbutton', { name: 'Storage', exact: true }).fill('122');
                await page.getByRole('spinbutton', { name: 'Price', exact: true }).click();
                await page.getByRole('spinbutton', { name: 'Price', exact: true }).fill('2111');
                await page.getByTestId('saveButton').click();
            }

            page.once('dialog', async function(dialog) {
                await dialog.accept();
            });
            await page.getByTestId('button-table-remove').click();
            await page.waitForTimeout(500);
        }
    }
});