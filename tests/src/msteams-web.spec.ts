import { expect, test } from "@playwright/test";
import {
  MSTeamsWeb,
  M365Credential,
  TimeHelper,
} from "@msteams-playwright/core";

require("dotenv").config();

let m365Cred: M365Credential = {
  upn: process.env.M365_UPN,
  pwd: process.env.M365_PWD,
};

let msTeamsWeb: MSTeamsWeb = new MSTeamsWeb(m365Cred);

test.describe.configure({ mode: "parallel" });

test.beforeAll(async () => {
  await msTeamsWeb.launch();
});

test.afterAll(async () => {
  await msTeamsWeb.close();
});

test("should be connected as Adele Vance", async () => {
  let page = await msTeamsWeb.bctx.newPage();
  await page.goto("https://teams.microsoft.com");
  await page.mainFrame().locator('[aria-label="Profile\\."]').click();
  await expect(page.mainFrame().locator('ul[role="menu"]')).toContainText(
    "Adele Vance"
  );
});

test("Adele Vance can use chat feature", async () => {
  let page = await msTeamsWeb.bctx.newPage();
  await page.goto("https://teams.microsoft.com");
  await expect(page.mainFrame().locator('[aria-label="Chat Toolbar more options"]')).toBeDefined();
});
