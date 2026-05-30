import { By, until } from "selenium-webdriver";

export async function runWeeklyScheduleTests(driver, baseUrl) {
  await driver.get(`${baseUrl}/admin/weekly-schedule`);

  await driver.wait(
    until.elementLocated(By.xpath("//h1[contains(.,'Thực đơn theo tuần') or contains(.,'Quản lý thực đơn theo tuần')]")),
    10000,
  );

  const wednesdayButton = await driver.wait(
    until.elementLocated(By.xpath("//button[.//p[contains(.,'Thứ Tư')]]")),
    10000,
  );

  await wednesdayButton.click();
  await driver.wait(
    until.elementLocated(By.xpath("//h2[contains(.,'Thực đơn Thứ Tư')]")),
    10000,
  );
}
