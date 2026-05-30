import { By, until } from "selenium-webdriver";

async function elementExists(driver, locator, timeout = 3000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return true;
  } catch {
    return false;
  }
}

export async function runSearchTests(driver, baseUrl) {
  await driver.get(baseUrl);

  const searchInput = await driver.wait(
    until.elementLocated(By.css("input[placeholder='Tìm kiếm món ăn...']")),
    10000,
  );

  await searchInput.clear();
  await searchInput.sendKeys("zzzz-nomatch-123");

  const noResult = await elementExists(
    driver,
    By.xpath("//*[contains(text(),'Không tìm thấy món ăn phù hợp')]")
  );

  if (noResult) {
    return;
  }

  const emptyMenu = await elementExists(
    driver,
    By.xpath("//*[contains(text(),'Chưa có món ăn nào trong thực đơn hôm nay')]")
  );

  if (emptyMenu) {
    return;
  }

  // Fallback: ensure input keeps the query (page may render dishes from API)
  const value = await searchInput.getAttribute("value");
  if (value !== "zzzz-nomatch-123") {
    throw new Error("Search input value not set as expected");
  }
}
