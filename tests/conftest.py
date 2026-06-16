"""Shared fixtures for WorkSure Selenium tests."""

import os
import time

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from helpers import (
    BASE_URL,
    API_URL,
    DEFAULT_PASSWORD,
    DEMO_USERS,
    login_via_ui,
    logout_via_ui,
)


def wait_for_servers(timeout=60):
    """Block until frontend and backend respond."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            if requests.get(f"{API_URL}/health", timeout=3).status_code == 200:
                if requests.get(BASE_URL, timeout=3).status_code == 200:
                    return
        except requests.RequestException:
            pass
        time.sleep(1)
    raise RuntimeError(
        f"WorkSure servers not reachable at {BASE_URL} and {API_URL}. "
        "Start backend (npm run dev) and frontend (npm run dev) first."
    )


@pytest.fixture(scope="session", autouse=True)
def ensure_servers():
    wait_for_servers()


@pytest.fixture
def driver():
    opts = Options()
    if os.environ.get("WORKSURE_HEADLESS", "1") == "1":
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1400,900")
    opts.add_argument("--disable-gpu")

    service = Service(ChromeDriverManager().install())
    browser = webdriver.Chrome(service=service, options=opts)
    browser.implicitly_wait(5)
    yield browser
    browser.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 15)


@pytest.fixture
def base_url():
    return BASE_URL


@pytest.fixture
def customer_session(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["customer"], DEFAULT_PASSWORD, base_url)
    yield driver
    logout_via_ui(driver, wait)


@pytest.fixture
def worker_session(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["worker"], DEFAULT_PASSWORD, base_url)
    yield driver
    logout_via_ui(driver, wait)


@pytest.fixture
def admin_session(driver, wait, base_url):
    login_via_ui(driver, wait, DEMO_USERS["admin"], DEFAULT_PASSWORD, base_url)
    yield driver
    logout_via_ui(driver, wait)
