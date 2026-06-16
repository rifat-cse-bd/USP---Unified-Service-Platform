"""Admin dashboard pages."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_admin_dashboard(admin_session, wait, base_url):
    driver = admin_session
    driver.get(f"{base_url}/admin/dashboard")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "admin" in driver.page_source.lower() or "dashboard" in driver.page_source.lower()


def test_admin_users_page(admin_session, wait, base_url):
    driver = admin_session
    driver.get(f"{base_url}/admin/users")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "user" in driver.page_source.lower()


def test_admin_orders_page(admin_session, wait, base_url):
    driver = admin_session
    driver.get(f"{base_url}/admin/orders")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "order" in driver.page_source.lower()


def test_admin_workers_page(admin_session, wait, base_url):
    driver = admin_session
    driver.get(f"{base_url}/admin/workers")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "worker" in driver.page_source.lower()
