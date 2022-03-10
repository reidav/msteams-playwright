import { Electron , expect} from "@playwright/test";
import { cp } from "fs";

const { _electron: electron, Page } = require('playwright')
const { test } = require('@playwright/test')

export async function pause(ms: number) {
    return new Promise(f => setTimeout(f, ms));
}

class MSTeamsPwHelper {
    electronApp: any;

    constructor(electronApp: any) {
        this.electronApp = electronApp;
    }

    async dumpPageFrameTree() {
        let eutil = this;
        await this.electronApp.windows().forEach(async function (page: any) {
            let page_title = await page.title();
            console.log("'" + page_title + "', '" + page.url() + "'");
            eutil._dumpFrameTree(page.mainFrame(), " ->");
        });
    }

    _dumpFrameTree(frame: any, indent: any) {
        console.log(indent + "'" + frame.name() + "', '" + frame.url() + "'");
        for (const child of frame.childFrames()) {
            this._dumpFrameTree(child, indent + '  ');
        }
    }

    getWindowHostingFrame(frameUrl: string): any {
        let pages = this.electronApp.windows();

        for (let i = 0; i < pages.length; i++) {
            let page = pages[i];
            let frames = page.frames();

            for (let j = 0; j < frames.length; j++) {
                if (frames[j].url().startsWith(frameUrl)) {
                    return page;
                } 
            }
        }

        return null;
    }

    async getMainPage(): Promise<any> {
        let pages = this.electronApp.windows();

        for (let i = 0; i < pages.length; i++) {
            let page = pages[i];
            let page_title = await page.title();
            if (page_title != "" && page_title != "Microsoft Teams Notification") {
                return page;
            }
        }

        return null;
    }
}

test('app launched with authenticated user', async () => {

    const electronApp = await electron.launch({
        executablePath: "/usr/share/teams/teams"
    })

    let mpw = new MSTeamsPwHelper(electronApp);

    // Wait for get_started_window
    let first_window = await electronApp.firstWindow();
    await pause(2000);

    // Fill the get_started_window
    let get_started_window = mpw.getWindowHostingFrame("file:///usr/share/teams/resources/app.asar/lib/renderer/preLogin/accountSelect.html")
    await get_started_window.locator('[aria-label="Select\\ an\\ account\\ to\\ sign\\ in\\ to\\ Teams"]').click();
    await get_started_window.locator('[placeholder="Sign-in\\ address"]').click();
    await get_started_window.locator('[placeholder="Sign-in\\ address"]').fill('<UPN>');
    await get_started_window.locator('text=Next').click();
    await pause(3000);

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
    await pause(3000);

    let main_window = await mpw.getMainPage();
    await main_window.mainFrame().locator('[aria-label="Profile\\."]').click();
    await expect(main_window.mainFrame().locator('ul[role="menu"]')).toContainText("Adele Vance");

    // close app
    await electronApp.close()
})