"""Shared helpers for WorkSure Selenium tests."""

import os

BASE_URL = os.environ.get("WORKSURE_BASE_URL", "http://localhost:5173")
API_URL = os.environ.get("WORKSURE_API_URL", "http://localhost:5000")
DEFAULT_PASSWORD = os.environ.get("WORKSURE_TEST_PASSWORD", "Password123!")

DEMO_USERS = {
    "customer": os.environ.get("WORKSURE_CUSTOMER_EMAIL", "customer@worksure.com"),
    "worker": os.environ.get("WORKSURE_WORKER_EMAIL", "worker1@worksure.com"),
    "admin": os.environ.get("WORKSURE_ADMIN_EMAIL", "admin@worksure.com"),
}


def login_via_ui(driver, wait, email, password, base_url=BASE_URL):
    """Log in through the login form and wait for dashboard redirect."""
    driver.get(f"{base_url}/login")
    wait.until(lambda d: d.find_element("id", "email")).clear()
    driver.find_element("id", "email").send_keys(email)
    driver.find_element("id", "password").send_keys(password)
    driver.find_element("xpath", "//button[@type='submit']").click()
    wait.until(lambda d: "/login" not in d.current_url)


def logout_via_ui(driver, wait):
    """Click log out if the user is signed in."""
    try:
        btn = driver.find_element("xpath", "//button[contains(., 'Log out')]")
        btn.click()
        wait.until(lambda d: "/login" in d.current_url or d.current_url.rstrip("/").endswith(""))
    except Exception:
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear();")
