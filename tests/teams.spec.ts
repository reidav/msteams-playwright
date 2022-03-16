import { expect} from "@playwright/test";

const { _electron: electron, Page } = require('playwright')
const { test } = require('@playwright/test')

import { MSTeamsHelper, TimeHelper } from "./helpers";

test('app launched with authenticated user', async () => {
    
    const electronApp = await electron.launch({
        executablePath: "/usr/share/teams/teams"
    })

    let mpw = new MSTeamsHelper(electronApp);

    // Wait for get_started_window
    let first_window = await electronApp.firstWindow();
    await TimeHelper.pause(2000);

    // Fill the get_started_window
    let get_started_window = mpw.getWindowHostingFrame("file:///usr/share/teams/resources/app.asar/lib/renderer/preLogin/accountSelect.html")
    await get_started_window.locator('[aria-label="Select\\ an\\ account\\ to\\ sign\\ in\\ to\\ Teams"]').click();
    await get_started_window.locator('[placeholder="Sign-in\\ address"]').click();
    await get_started_window.locator('[placeholder="Sign-in\\ address"]').fill('<UPN>>');
    await get_started_window.locator('text=Next').click();
    await TimeHelper.pause(3000);

    // Fill the login_window
    let login_window = mpw.getWindowHostingFrame("https://login.microsoftonline.com/common")
    await login_window.locator('[placeholder="Email\\,\\ phone\\,\\ or\\ Skype"]').click();
    await login_window.locator('[placeholder="Email\\,\\ phone\\,\\ or\\ Skype"]').fill('<UPN>');
    await login_window.locator('text=Next').click()
    await login_window.waitForNavigation()
    await login_window.locator('[placeholder="Password"]').click();
    await login_window.locator('[placeholder="Password"]').fill('<PWD>');
    await login_window.locator('input:has-text("Sign in")').click();;
    await login_window.waitForNavigation()
    await login_window.locator('text=No').click()
    await login_window.waitForNavigation()
    await TimeHelper.pause(3000);

    let main_window = await mpw.getMainPage();
    await main_window.mainFrame().locator('[aria-label="Profile\\."]').click();
    await expect(main_window.mainFrame().locator('ul[role="menu"]')).toContainText("Adele Vance");

    // close app
    await electronApp.close()
})