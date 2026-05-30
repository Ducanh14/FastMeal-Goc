import { By, until } from "selenium-webdriver";

export async function runAuthValidationTests(driver, baseUrl) {
  await driver.get(baseUrl);

  // Open register modal from navbar
  const registerBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Đăng ký']")),
    10000,
  );
  await registerBtn.click();

  // Wait for modal header
  await driver.wait(
    until.elementLocated(By.xpath("//h2[contains(.,'ĐĂNG KÝ')]")),
    10000,
  );

  // Test: password mismatch
  await driver.findElement(By.css("input[placeholder='Nhập họ tên']")).sendKeys("Test User");
  await driver.findElement(By.css("input[placeholder='example@email.com']")).sendKeys("testuser@example.com");
  await driver.findElement(By.css("input[placeholder='Nhập mật khẩu']")).sendKeys("123456");
  await driver.findElement(By.css("input[placeholder='Nhập lại mật khẩu']")).sendKeys("654321");
  await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG KÝ']")).click();

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Mật khẩu xác nhận không khớp')]")),
    10000,
  );

  // Refresh and reopen modal for next case
  await driver.navigate().refresh();
  const registerBtn2 = await driver.wait(
    until.elementLocated(By.xpath("//button[normalize-space()='Đăng ký']")),
    10000,
  );
  await registerBtn2.click();
  await driver.wait(
    until.elementLocated(By.xpath("//h2[contains(.,'ĐĂNG KÝ')]")),
    10000,
  );

  // Test: password length < 6
  await driver.findElement(By.css("input[placeholder='Nhập họ tên']")).sendKeys("Test User");
  await driver.findElement(By.css("input[placeholder='example@email.com']")).sendKeys("testuser2@example.com");
  await driver.findElement(By.css("input[placeholder='Nhập mật khẩu']")).sendKeys("12345");
  await driver.findElement(By.css("input[placeholder='Nhập lại mật khẩu']")).sendKeys("12345");
  await driver.findElement(By.xpath("//button[normalize-space()='ĐĂNG KÝ']")).click();

  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Mật khẩu phải có ít nhất 6 ký tự')]")),
    10000,
  );
}
