import { Locator, Page } from '@playwright/test';

export class HomeSidenav {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get checkboxPrivateChannel(): Locator {
		return this.page.locator(
			'//*[@id="modal-root"]//*[contains(@class, "rcx-field") and contains(text(), "Private")]/../following-sibling::label/i',
		);
	}

	get inputChannelName(): Locator {
		return this.page.locator('#modal-root [placeholder="Channel Name"]');
	}

	get btnCreateChannel(): Locator {
		return this.page.locator('//*[@id="modal-root"]//button[contains(text(), "Create")]');
	}

	async openNewByLabel(text: string): Promise<void> {
		await this.page.locator('[data-qa="sidebar-create"]').click();
		await this.page.locator(`li.rcx-option >> text="${text}"`).click();
	}

	async logout(): Promise<void> {
		await this.page.locator('[data-qa="sidebar-avatar-button"]').click();
		await this.page.locator('//*[contains(@class, "rcx-option__content") and contains(text(), "Logout")]').click();
	}

	async goToMyAccount(): Promise<void> {
		await this.page.locator('[data-qa="sidebar-avatar-button"]').click();
		await this.page.locator('//li[@class="rcx-option"]//div[contains(text(), "My Account")]').click();
	}

	async openChat(name: string): Promise<void> {
		await this.page.locator('[data-qa="sidebar-search"]').click();
		await this.page.locator('[data-qa="sidebar-search-input"]').type(name);
		await this.page.locator('[data-qa="sidebar-item-title"]', { hasText: name }).first().click();
	}

	async createPublicChannel(name: string) {
		await this.openNewByLabel('Channel');
		await this.checkboxPrivateChannel.click();
		await this.inputChannelName.type(name);
		await this.btnCreateChannel.click();
	}
}
