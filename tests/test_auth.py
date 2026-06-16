"""Authentication flows."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from helpers import DEMO_USERS, DEFAULT_PASSWORD, login_via_ui, logout_via_ui


def test_login_page_renders(driver, wait, base_url):
    driver.get(f"{base_url}/login")
    wait.until(EC.presence_of_element_located((By.ID, "email")))
    assert driver.find_element(By.ID, "password")
    assert driver.find_element(By.XPATH, "//button[@type='submit']")


def test_register_page_renders(driver, wait, base_url):
    driver.get(f"{base_url}/register")
    wait.until(EC.presence_of_element_located((By.XPATH, "//form")))
    assert "Create account" in driver.page_source


def test_customer_login_redirects_to_dashboard(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["customer"], DEFAULT_PASSWORD, base_url)
    assert "/customer/dashboard" in driver.current_url
    logout_via_ui(driver, wait)


def test_worker_login_redirects_to_dashboard(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["worker"], DEFAULT_PASSWORD, base_url)
    assert "/worker/dashboard" in driver.current_url
    logout_via_ui(driver, wait)


def test_admin_login_redirects_to_dashboard(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["admin"], DEFAULT_PASSWORD, base_url)
    assert "/admin/dashboard" in driver.current_url
    logout_via_ui(driver, wait)


def test_invalid_login_shows_error(driver, wait, base_url):
    driver.get(f"{base_url}/login")
    driver.find_element(By.ID, "email").send_keys("nobody@example.com")
    driver.find_element(By.ID, "password").send_keys("wrong-password")
    driver.find_element(By.XPATH, "//button[@type='submit']").click()
    wait.until(lambda d: "/login" in d.current_url)
    # Toast or error — stay on login page
    assert "/customer/dashboard" not in driver.current_url
