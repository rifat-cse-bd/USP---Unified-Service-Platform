"""Customer booking, cart, and orders."""

import time

import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from helpers import API_URL, DEMO_USERS, DEFAULT_PASSWORD


def _get_active_service_id():
    """Fetch first active service via public API."""
    r = requests.get(f"{API_URL}/api/services", params={"limit": 5}, timeout=10)
    r.raise_for_status()
    services = r.json().get("services") or []
    if not services:
        raise RuntimeError("No services in database — run backend seed first.")
    return services[0]["id"]


def _customer_token():
    r = requests.post(
        f"{API_URL}/api/auth/login",
        json={"email": DEMO_USERS["customer"], "password": DEFAULT_PASSWORD},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()["token"]


def test_book_service_via_ui(customer_session, wait, base_url):
    driver = customer_session
    service_id = _get_active_service_id()
    driver.get(f"{base_url}/offer/{service_id}")

    wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Book now')]")))
    address_input = driver.find_element(By.XPATH, "//input[@placeholder='Area, road, flat']")
    address_input.clear()
    address_input.send_keys("Gulshan, Dhaka — Selenium test")

    driver.find_element(By.XPATH, "//button[contains(., 'Book now')]").click()
    wait.until(lambda d: "/customer/orders" in d.current_url)
    assert "order" in driver.page_source.lower() or "booking" in driver.page_source.lower()


def test_add_to_cart_and_checkout(customer_session, wait, base_url):
    driver = customer_session
    service_id = _get_active_service_id()
    driver.get(f"{base_url}/offer/{service_id}")

    wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Add to cart')]")))
    driver.find_element(By.XPATH, "//button[contains(., 'Add to cart')]").click()
    time.sleep(1)

    driver.get(f"{base_url}/customer/cart")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "cart" in driver.page_source.lower()

    driver.get(f"{base_url}/customer/checkout")
    wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(., 'Continue')] | //button[contains(., 'Checkout')] | //button[contains(., 'Pay')]")))
    checkout_btn = driver.find_elements(
        By.XPATH,
        "//button[contains(., 'Continue to payment') or contains(., 'Checkout') or contains(., 'Create booking')]",
    )
    if checkout_btn:
        checkout_btn[0].click()
        time.sleep(1)


def test_booking_api_accepts_iso_datetime():
    """Regression: ISO8601 scheduled_at must not break MySQL insert."""
    token = _customer_token()
    service_id = _get_active_service_id()
    scheduled_at = "2026-07-01T10:30:00.000Z"
    r = requests.post(
        f"{API_URL}/api/bookings",
        json={
            "service_id": service_id,
            "scheduled_at": scheduled_at,
            "address": "API test address",
            "notes": "Selenium regression",
        },
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body.get("success") is True
    assert body.get("booking", {}).get("id")


def test_customer_orders_page(customer_session, wait, base_url):
    driver = customer_session
    driver.get(f"{base_url}/customer/orders")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "order" in driver.page_source.lower()


def test_customer_bookings_page(customer_session, wait, base_url):
    driver = customer_session
    driver.get(f"{base_url}/customer/bookings")
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
    assert "booking" in driver.page_source.lower()
