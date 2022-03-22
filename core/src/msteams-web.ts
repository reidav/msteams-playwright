const { chromium, Page } = require('playwright')
import { M365Credential } from './shared';

export class MSTeamsWeb {
    cred : M365Credential;

    browser: any;
    bctx: any;
    bpage: any;

    constructor(cred : M365Credential) 
    { 
        this.cred = cred;
    }

    public async launch() {
        this.browser = await chromium.launch({ headless: true });

        this.bctx = await this.browser.newContext();
        this.bpage = await this.bctx.newPage();

        await this.bpage.goto('https://teams.microsoft.com/');
        await this.bpage.waitForNavigation();

        await this.bpage.locator('[placeholder="Email\\, phone\\, or Skype"]').fill(this.cred.upn);
        await this.bpage.locator('text=Next').click()
        await this.bpage.waitForNavigation();

        await this.bpage.locator('[placeholder="Password"]').fill(this.cred.pwd);
        await this.bpage.locator('input:has-text("Sign in")').click();
        await this.bpage.locator('text=No').click();
        await this.bpage.waitForNavigation();
    }

    public async close() { }
}