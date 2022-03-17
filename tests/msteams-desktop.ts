const { _electron: electron, Page } = require('playwright')
import { TimeHelper } from "./utils";
const os = require('os');
const fs = require("fs");
const path = require('path');

export class MSTeamsDesktop {
    electronApp: any;

    constructor() { }

    public async launch() {

        this.emptyConfigFiles();

        this.electronApp = await electron.launch({
            executablePath: "/usr/share/teams/teams"
        });

        // Wait for get_started_window
        let first_window = await this.electronApp.firstWindow();

        // Fill the get_started_window
        let get_started_window = await this.waitForPageWithFrame("file:///usr/share/teams/resources/app.asar/lib/renderer/preLogin/accountSelect.html")
        await get_started_window.locator('[aria-label="Select\\ an\\ account\\ to\\ sign\\ in\\ to\\ Teams"]').click();
        await get_started_window.locator('[placeholder="Sign-in\\ address"]').click();
        await get_started_window.locator('[placeholder="Sign-in\\ address"]').fill(process.env.M365_UPN);
        await get_started_window.locator('text=Next').click();

        // Fill the login_window
        let login_window  = await this.waitForPageWithFrame("https://login.microsoftonline.com/common")
        await login_window.locator('[placeholder="Email\\,\\ phone\\,\\ or\\ Skype"]').click();
        await login_window.locator('[placeholder="Email\\,\\ phone\\,\\ or\\ Skype"]').fill(process.env.M365_UPN);
        await login_window.locator('text=Next').click()
        await login_window.locator('[placeholder="Password"]').click();
        await login_window.locator('[placeholder="Password"]').fill(process.env.M365_PWD);
        await login_window.locator('input:has-text("Sign in")').click();
        await login_window.locator('text=No').click();
    }

    async close(){
        await this.electronApp.close();
    }

    public async waitForLandingPage() : Promise<any> {
        return await this.waitForPage("https://teams.microsoft.com");
    }

    private async waitForPage(pageUrl: string) : Promise<any> {
        let desired_page : any;

        while (!desired_page){
            await new Promise(r => setTimeout(r, 500));

            let pages = this.electronApp.windows();

            for (let i = 0; i < pages.length; i++) {
                let page = pages[i];
                if (page.url().startsWith(pageUrl)){
                    desired_page = page;
                } 
            }
        }
        return desired_page;
    }

    private async waitForPageWithFrame(frameUrl: string) : Promise<any> {
        let desired_page : any;

        while (!desired_page){
            await new Promise(r => setTimeout(r, 500));

            let pages = this.electronApp.windows();

            for (let i = 0; i < pages.length; i++) {
                let page = pages[i];
                let frames = page.frames();

                for (let j = 0; j < frames.length; j++) {
                    if (frames[j].url().startsWith(frameUrl)) {
                        desired_page = page;
                    } 
                }
            }
        }
        return desired_page;
    }
    
    private async emptyConfigFiles() {
        const teams_config_path = path.join(os.homedir(), "/.config/Microsoft/Microsoft\ Teams/");

        fs.rm(teams_config_path, { recursive: true }, (error: any) => {
            if (error) {
              console.log(error);
            }
          });
    }

    // Debugging Helpers 

    public async dumpPageFrameTree() {
        let util = this;
        await this.electronApp.windows().forEach(async function (page: any) {
            let page_title = await page.title();
            console.error("'" + page_title + "', '" + page.url() + "'");
            util.dumpFrameTree(page.mainFrame(), " ->");
        });
    }

    private dumpFrameTree(frame: any, indent: any) {
        console.log(indent + "'" + frame.name() + "', '" + frame.url() + "'");
        for (const child of frame.childFrames()) {
            this.dumpFrameTree(child, indent + '  ');
        }
    }    
}