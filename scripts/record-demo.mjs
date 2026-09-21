import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const deliverablesDir = path.join(projectRoot, 'deliverables', 'demo-video');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const baseUrl = 'http://127.0.0.1:8000';

const now = new Date();
const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '-',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
].join('');

const uniqueId = Date.now().toString().slice(-6);
const clientEmail = `demo.video.${uniqueId}@example.com`;
const clientPassword = 'Demo12345!';
const categoryName = `Video Demo ${uniqueId}`;
const categorySlug = `video-demo-${uniqueId}`;
const productName = `Roll Video ${uniqueId}`;
const videoPath = path.join(deliverablesDir, `miya-sushi-demo-${stamp}.webm`);
const notesPath = path.join(deliverablesDir, `miya-sushi-demo-${stamp}.txt`);

await fs.mkdir(deliverablesDir, { recursive: true });

function log(step) {
    console.log(`[demo] ${step}`);
}

async function pause(page, ms = 1400) {
    await page.waitForTimeout(ms);
}

async function waitForToast(page) {
    const toast = page.locator('.toast');
    await toast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    await pause(page, 1200);
}

async function login(page, email, password) {
    await page.locator('.auth-buttons > button').click();
    await pause(page, 700);

    const modal = page.locator('.modal-content');
    await modal.locator('input[type="email"]').fill(email);
    await modal.locator('input[type="password"]').fill(password);
    await modal.locator('form').getByRole('button', { name: 'Se connecter' }).click();

    await page.locator('.user-info').waitFor({ state: 'visible', timeout: 15000 });
    await waitForToast(page);
}

async function logout(page) {
    await page.locator('.auth-buttons .btn.btn-secondary').click();
    await page.locator('.auth-buttons > button').waitFor({ state: 'visible', timeout: 15000 });
    await waitForToast(page);
}

async function registerClient(page) {
    log('Registering a new client account');
    await page.locator('.auth-buttons > button').click();
    await pause(page, 700);

    const modal = page.locator('.modal-content');
    await modal.getByRole('button', { name: "S'inscrire" }).click();
    await pause(page, 500);

    const registerInputs = modal.locator('input.form-input');
    await registerInputs.nth(0).fill('Client Video Demo');
    await registerInputs.nth(1).fill(clientEmail);
    await registerInputs.nth(2).fill('0612345678');
    await modal.locator('textarea.form-input').fill('45 rue du Sushi, Paris 75001');
    await registerInputs.nth(3).fill(clientPassword);
    await registerInputs.nth(4).fill(clientPassword);
    await pause(page, 800);
    await modal.getByRole('button', { name: 'Créer mon compte' }).click();

    await page.locator('.user-info').waitFor({ state: 'visible', timeout: 15000 });
    await waitForToast(page);
}

async function placeOrder(page, { productNameText, quantityIncrements = 0, deliveryType = 'delivery', comments = '' }) {
    const menuCard = page.locator('.menu-card').filter({ hasText: productNameText }).first();
    await menuCard.scrollIntoViewIfNeeded();
    await pause(page, 700);
    await menuCard.locator('button.add-to-cart').click();

    const cartModal = page.locator('.modal-content').filter({ hasText: 'Mon Panier' });
    await cartModal.waitFor({ state: 'visible', timeout: 10000 });
    await pause(page, 900);

    for (let index = 0; index < quantityIncrements; index += 1) {
        await cartModal.locator('.cart-item').first().locator('button.quantity-btn').last().click();
        await pause(page, 500);
    }

    if (deliveryType === 'takeaway') {
        await cartModal.locator('input[value="takeaway"]').check();
        await pause(page, 700);
    } else {
        await cartModal.locator('input[value="delivery"]').check();
        await pause(page, 500);
    }

    if (comments) {
        await cartModal.locator('textarea.form-input').fill(comments);
        await pause(page, 600);
    }

    await cartModal.getByRole('button', { name: 'Valider la Commande' }).click();
    await page.getByRole('heading', { name: 'Mes Commandes' }).waitFor({ state: 'visible', timeout: 15000 });
    await waitForToast(page);
}

async function createCategory(page) {
    log('Creating an admin category');
    const adminTabs = page.locator('.admin-tab-container .tabs button');
    await adminTabs.nth(2).click();
    await pause(page, 1000);

    const categoryCard = page.locator('.manager-card').first();
    await categoryCard.scrollIntoViewIfNeeded();
    await categoryCard.locator('input.form-input').nth(0).fill(categoryName);
    await categoryCard.locator('input.form-input').nth(1).fill(categorySlug);
    await categoryCard.locator('input.form-input').nth(2).fill('7');
    await pause(page, 800);
    await categoryCard.getByRole('button', { name: 'Créer la catégorie' }).click();
    await waitForToast(page);
}

async function createAndManageProduct(page) {
    log('Creating and managing an admin product');
    const adminTabs = page.locator('.admin-tab-container .tabs button');
    await adminTabs.nth(1).click();
    await pause(page, 1000);

    const productCard = page.locator('.manager-card').first();
    await productCard.scrollIntoViewIfNeeded();
    await productCard.locator('select.form-input').selectOption({ label: categoryName });
    await productCard.locator('input.form-input').nth(0).fill(productName);
    await productCard.locator('textarea.form-input').fill('Creation video de demonstration pour valider le back office.');
    await productCard.locator('input.form-input').nth(1).fill('14.90');
    await productCard.locator('input.form-input').nth(2).fill('9');
    await productCard.locator('input.form-input').nth(3).fill('https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=1200&auto=format&fit=crop');
    await productCard.locator('input[type="checkbox"]').nth(0).check();
    await pause(page, 900);
    await productCard.getByRole('button', { name: 'Créer le produit' }).click();
    await waitForToast(page);

    const productListItem = page.locator('.manager-list-item').filter({ hasText: productName }).first();
    await productListItem.scrollIntoViewIfNeeded();
    await pause(page, 800);
    await productListItem.getByRole('button', { name: 'Modifier' }).click();
    await pause(page, 900);

    await productCard.locator('input.form-input').nth(1).fill('15.90');
    await productCard.getByRole('button', { name: 'Mettre à jour' }).click();
    await waitForToast(page);

    const updatedItem = page.locator('.manager-list-item').filter({ hasText: productName }).first();
    await updatedItem.scrollIntoViewIfNeeded();
    await pause(page, 800);
    await updatedItem.getByRole('button', { name: 'Masquer' }).click();
    await waitForToast(page);

    await updatedItem.getByRole('button', { name: 'Supprimer' }).click();
    await waitForToast(page);
}

async function deleteCategory(page) {
    log('Deleting the temporary admin category');
    const adminTabs = page.locator('.admin-tab-container .tabs button');
    await adminTabs.nth(2).click();
    await pause(page, 1000);

    const categoryItem = page.locator('.manager-list-item').filter({ hasText: categoryName }).first();
    await categoryItem.scrollIntoViewIfNeeded();
    await pause(page, 800);
    await categoryItem.getByRole('button', { name: 'Supprimer' }).click();
    await waitForToast(page);
}

const browser = await chromium.launch({
    executablePath: edgePath,
    headless: false,
    slowMo: 250,
    args: ['--disable-infobars'],
});

const context = await browser.newContext({
    viewport: {
        width: 1440,
        height: 900,
    },
    recordVideo: {
        dir: deliverablesDir,
        size: {
            width: 1440,
            height: 900,
        },
    },
});

context.setDefaultTimeout(20000);

const page = await context.newPage();
const video = page.video();

page.on('dialog', async (dialog) => {
    await dialog.accept();
});

try {
    log('Opening the home page');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await pause(page, 2200);

    await page.getByRole('button', { name: 'Explorer la Carte' }).click();
    await pause(page, 1800);

    const menuTabs = page.locator('.tab-container .tabs button');
    await menuTabs.nth(1).click();
    await pause(page, 1300);
    await menuTabs.nth(2).click();
    await pause(page, 1300);
    await menuTabs.nth(0).click();
    await pause(page, 1500);

    await registerClient(page);
    await pause(page, 1600);

    log('Placing the first client order');
    await placeOrder(page, {
        productNameText: 'California Roll',
        quantityIncrements: 1,
        deliveryType: 'delivery',
        comments: 'Livraison de demonstration sans wasabi.',
    });

    const firstOrderNumber = (await page.locator('.order-card .order-number').first().innerText()).trim();
    await pause(page, 1800);

    log('Placing the second client order');
    await page.getByRole('button', { name: 'Menu' }).click();
    await pause(page, 1000);
    await page.locator('.tab-container .tabs button').nth(1).click();
    await pause(page, 1000);
    await placeOrder(page, {
        productNameText: 'Dragon Roll',
        quantityIncrements: 0,
        deliveryType: 'takeaway',
        comments: 'Commande de demonstration a emporter.',
    });

    const orderNumbers = await page.locator('.order-card .order-number').allTextContents();
    const secondOrderNumber = orderNumbers.find((text) => text.trim() !== firstOrderNumber) ?? orderNumbers[1];
    await pause(page, 2200);

    log('Switching to the admin account');
    await logout(page);
    await pause(page, 1200);
    await login(page, 'admin@gmail.com', '123');
    await pause(page, 2200);

    const firstAdminOrder = page.locator('.order-card').filter({ hasText: firstOrderNumber }).first();
    await firstAdminOrder.scrollIntoViewIfNeeded();
    await pause(page, 900);
    await firstAdminOrder.getByRole('button', { name: 'Accepter la commande' }).click();
    await waitForToast(page);

    const secondAdminOrder = page.locator('.order-card').filter({ hasText: secondOrderNumber }).first();
    await secondAdminOrder.scrollIntoViewIfNeeded();
    await pause(page, 900);
    await secondAdminOrder.getByRole('button', { name: 'Refuser la commande' }).click();
    await waitForToast(page);
    await pause(page, 1800);

    await createCategory(page);
    await pause(page, 1600);
    await createAndManageProduct(page);
    await pause(page, 1600);
    await deleteCategory(page);
    await pause(page, 1600);

    log('Returning to the client account to show final statuses');
    await logout(page);
    await pause(page, 1200);
    await login(page, clientEmail, clientPassword);
    await pause(page, 1200);
    await page.getByRole('button', { name: 'Mes Commandes' }).click();
    await page.getByRole('heading', { name: 'Mes Commandes' }).waitFor({ state: 'visible', timeout: 15000 });
    await pause(page, 3200);

    await fs.writeFile(
        notesPath,
        [
            'Miya Sushi demo video',
            `Video file: ${videoPath}`,
            `Client account created: ${clientEmail}`,
            `Temporary category: ${categoryName}`,
            `Temporary product: ${productName}`,
            `Accepted order: ${firstOrderNumber}`,
            `Rejected order: ${secondOrderNumber}`,
        ].join('\n'),
        'utf8',
    );
} finally {
    await context.close();
}

const recordedVideoPath = await video.path();

if (recordedVideoPath !== videoPath) {
    await fs.copyFile(recordedVideoPath, videoPath);
}

await browser.close();
log(`Video saved to ${videoPath}`);
log(`Notes saved to ${notesPath}`);
