/* eslint-disable */
import webdriver from "selenium-webdriver";
import assert from "assert";
import path from "path";
import { Server } from "http";
import { AddressInfo } from "net";
import { startServer, Page } from "./_helpers";

jest.retryTimes(3);
jest.setTimeout(30 * 1000);

let server: Server;
let port: number;
let page: Page;

beforeAll(async () => {
  server = await startServer(4000);
  port = (server.address() as AddressInfo).port;
  let capabilities: webdriver.Capabilities = null as any;
  switch (process.env.BROWSER || "chrome") {
    case "ie": {
      // HACK: include IEDriver path by nuget
      const driverPath = path.join(
        __dirname,
        "../Selenium.WebDriver.IEDriver.3.150.0/driver/"
      );
      process.env.PATH = `${process.env.PATH};${driverPath};`;
      capabilities = webdriver.Capabilities.ie();
      capabilities.set("ignoreProtectedModeSettings", true);
      capabilities.set("ignoreZoomSetting", true);
      break;
    }
  }
  const driver = await new webdriver.Builder()
    .withCapabilities(capabilities)
    .build();
  page = new Page(driver);
});

afterAll(async () => {
  page && (await page.close());
  server.close();
});

it("Google", async () => {
  await page.loadUrl(`http://f49b303cd53b.ngrok.io/`);
  assert.equal(await page.title(), "Index of /");
});

it("Title is 'test'", async () => {
  await page.loadUrl(`http://localhost:${port}/`);
  assert.equal(await page.title(), "test");
});

it("Root content is 'hello'", async () => {
  await page.loadUrl(`http://localhost:${port}/`);
  const value = await page.getText("[data-testid='root']");
  assert.equal(value, "hello");
});
