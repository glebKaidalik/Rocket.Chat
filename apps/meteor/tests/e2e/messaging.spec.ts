import { Browser, Page } from '@playwright/test';

import { expect, test } from './utils/test';
import { HomeChannel } from './page-objects';
import { createTargetChannel } from './utils';

const createAuxContext = async (browser: Browser): Promise<{ page: Page; poHomeChannel: HomeChannel }> => {
	const page = await browser.newPage({ storageState: 'user2-session.json' });
	const poHomeChannel = new HomeChannel(page);
	await page.goto('/home');

	return { page, poHomeChannel };
};

test.use({ storageState: 'user1-session.json' });

test.describe.serial('Messaging', () => {
	let poHomeChannel: HomeChannel;
	let targetChannel: string;

	test.beforeAll(async ({ browser }) => {
		targetChannel = await createTargetChannel(browser);
	});

	test.beforeEach(async ({ page }) => {
		poHomeChannel = new HomeChannel(page);

		await page.goto('/home');
	});

	test('expect show "hello word" in both contexts (targetChannel)', async ({ browser }) => {
		await poHomeChannel.sidenav.openChat(targetChannel);
		const auxContext = await createAuxContext(browser);
		await auxContext.poHomeChannel.sidenav.openChat(targetChannel);

		await poHomeChannel.content.sendMessage('hello world');

		await expect(auxContext.poHomeChannel.content.lastUserMessage.locator('p')).toHaveText('hello world');
		await expect(poHomeChannel.content.lastUserMessage.locator('p')).toHaveText('hello world');

		await auxContext.page.close();
	});

	test('expect show "hello word" in both contexts (direct)', async ({ browser }) => {
		await poHomeChannel.sidenav.openChat('user2');
		const auxContext = await createAuxContext(browser);
		await auxContext.poHomeChannel.sidenav.openChat('user1');

		await poHomeChannel.content.sendMessage('hello world');

		await expect(poHomeChannel.content.lastUserMessage.locator('p')).toHaveText('hello world');
		await expect(auxContext.poHomeChannel.content.lastUserMessage.locator('p')).toHaveText('hello world');

		await auxContext.page.close();
	});
});
