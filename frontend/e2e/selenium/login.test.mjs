import { By, until } from "selenium-webdriver";

export async function runLoginTests(driver, baseUrl) {
  await driver.get(baseUrl);

  const loginBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Đăng nhập']")),
    10000,
  );
  await loginBtn.click();

  await driver.wait(
    until.elementLocated(By.xpath("//h2[contains(.,'ĐĂNG NHẬP')]")),
    10000,
  );

  await driver.findElement(By.css("input[placeholder='Email hoặc username']")).sendKeys("invalid_user");
  await driver.findElement(By.css("input[placeholder='Nhập mật khẩu']")).sendKeys("wrongpass");
  await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG NHẬP']")).click();

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Tài khoản hoặc mật khẩu không đúng')]")),
    10000,
  );
}
