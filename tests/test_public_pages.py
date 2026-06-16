"""Public marketing and browse pages."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_homepage_loads(driver, wait, base_url):
    driver.get(base_url)
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'WorkSure')]")))
    assert "WorkSure" in driver.page_source


def test_services_page(driver, wait, base_url):
    driver.get(f"{base_url}/services")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "service" in driver.page_source.lower() or "sector" in driver.page_source.lower()


def test_about_page(driver, wait, base_url):
    driver.get(f"{base_url}/about")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert len(driver.page_source) > 200


def test_contact_page(driver, wait, base_url):
    driver.get(f"{base_url}/contact")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))
    assert driver.find_elements(By.TAG_NAME, "textarea") or driver.find_elements(By.TAG_NAME, "input")


def test_faq_page(driver, wait, base_url):
    driver.get(f"{base_url}/faq")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "?" in driver.page_source or "faq" in driver.page_source.lower()


def test_search_page(driver, wait, base_url):
    driver.get(f"{base_url}/search")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "input")))
    assert "search" in driver.page_source.lower() or "worker" in driver.page_source.lower()


def test_service_sector_navigation(driver, wait, base_url):
    driver.get(f"{base_url}/services/cleaning")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "clean" in driver.page_source.lower()


def test_not_found_page(driver, wait, base_url):
    driver.get(f"{base_url}/404")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "404" in driver.page_source or "not found" in driver.page_source.lower()
