"""Worker dashboard and order management."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_worker_dashboard(worker_session, wait, base_url):
    driver = worker_session
    driver.get(f"{base_url}/worker/dashboard")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "dashboard" in driver.page_source.lower() or "worker" in driver.page_source.lower()


def test_worker_orders_page(worker_session, wait, base_url):
    driver = worker_session
    driver.get(f"{base_url}/worker/orders")
    wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'orders') or contains(., 'Orders')]")))
    assert "order" in driver.page_source.lower()


def test_worker_services_page(worker_session, wait, base_url):
    driver = worker_session
    driver.get(f"{base_url}/worker/services")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "service" in driver.page_source.lower()


def test_worker_profile_page(worker_session, wait, base_url):
    driver = worker_session
    driver.get(f"{base_url}/worker/profile")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "profile" in driver.page_source.lower()
