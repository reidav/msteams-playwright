import { expect, test } from "@playwright/test";
import { MSTeamsDesktop, M365Credential } from "@msteams-playwright/core";

require("dotenv").config();

let m365Cred: M365Credential = {
  upn: process.env.M365_UPN,
  pwd: process.env.M365_PWD,
};
let msTeamsDesktop: MSTeamsDesktop = new MSTeamsDesktop(m365Cred);

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await msTeamsDesktop.launch();
});

test.afterAll(async () => {
  await msTeamsDesktop.close();
});

test("should be connected as Adele Vance", async () => {
  let main_window = await msTeamsDesktop.waitForLandingPage();
  await main_window.mainFrame().locator('[aria-label="Profile\\."]').click();
  await expect(
    main_window.mainFrame().locator('ul[role="menu"]')
  ).toContainText("Adele Vance");
});

test("should be able to open teams app marketplace", async () => {
  let main_window = await msTeamsDesktop.waitForLandingPage();
  await main_window
    .mainFrame()
    .locator('[aria-label="More\\ added\\ apps\\ Toolbar"]')
    .click();
  await main_window.mainFrame().locator('[aria-label="More\\ apps"]').click();
  await expect(
    main_window.mainFrame().locator(".td-apps-gallery-header")
  ).toContainText("Apps");
});
