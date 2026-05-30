import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { runAuthValidationTests } from "./auth.validation.test.mjs";
import { runLoginTests } from "./login.test.mjs";
import { runSearchTests } from "./search.test.mjs";
import { runWeeklyScheduleTests } from "./weekly-schedule.test.mjs";

const baseUrl = process.env.BASE_URL || "http://localhost:3001";
const headless = process.env.HEADLESS !== "false";

async function run() {
  const options = new chrome.Options();
  if (headless) {
    options.addArguments("--headless=new");
  }
  options.addArguments("--window-size=1280,900");

  const driver = await new Builder().forBrowser("chrome").setChromeOptions(options).build();

  const results = [];
  const runCase = async (name, fn) => {
    try {
      await fn();
      results.push({ name, status: "PASS" });
    } catch (error) {
      results.push({ name, status: "FAIL", error });
    }
  };

  try {
    await runCase("auth.validation", () => runAuthValidationTests(driver, baseUrl));
    await runCase("auth.login", () => runLoginTests(driver, baseUrl));
    await runCase("search", () => runSearchTests(driver, baseUrl));
    await runCase("weekly.schedule", () => runWeeklyScheduleTests(driver, baseUrl));
  } finally {
    await driver.quit();
  }

  for (const r of results) {
    if (r.status === "PASS") {
      console.log(`PASS: ${r.name}`);
    } else {
      console.error(`FAIL: ${r.name}`);
      console.error(r.error);
    }
  }

  if (results.some((r) => r.status === "FAIL")) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
