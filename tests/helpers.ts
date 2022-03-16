export class TimeHelper {
    static pause(ms: number) {
        return new Promise(f => setTimeout(f, ms));
    }
}

export class MSTeamsHelper {
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