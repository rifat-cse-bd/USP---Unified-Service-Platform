import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class WorkSureMegaTestSuite(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Initializes the browser context for the entire application test run."""
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless")  # Leave commented to watch the browser window
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.maximize_window()
        cls.base_url = "http://localhost:5173"
        cls.wait = WebDriverWait(cls.driver, 5) 

    @classmethod
    def tearDownClass(cls):
        """Cleans up the testing session."""
        cls.driver.quit()

    def scroll_page_factory(self):
        """Simulates a slow, natural human scroll from top to bottom, then jumps back up."""
        try:
            total_height = self.driver.execute_script("return document.body.scrollHeight")
            # Increased step delay to make the scrolling action noticeably slower
            for position in range(0, total_height, 250):
                self.driver.execute_script(f"window.scrollTo(0, {position});")
                time.sleep(0.1) # Smooth, slower scroll pacing
            
            time.sleep(1.5) # Pause at the very bottom of the page to look at the layout
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1.0) # Pause at the top before moving on
        except Exception:
            pass 

    def check_public_urls(self, url_list):
        """Helper to loop through, visit, scroll, and verify public access paths slowly."""
        for url in url_list:
            self.driver.get(url)
            print(f"👀 Viewing: {url}")
            time.sleep(2.0) # 2-second pause right after the page loads to visually inspect it
            self.scroll_page_factory()
            self.assertFalse("404" in self.driver.title, f"Error: Page not found! Missing path: {url}")

    def login_helper(self, email, password):
        """Authentication routing helper with deliberate pacing."""
        self.driver.get(f"{self.base_url}/login")
        time.sleep(1.5) # Pause to see the login screen load
        
        email_field = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"]')))
        password_field = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
        
        try:
            login_btn = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
        except:
            login_btn = self.driver.find_element(By.XPATH, "//button[contains(normalize-space(), 'Login') or contains(normalize-space(), 'Sign In')]")
        
        email_field.clear()
        password_field.clear()
        
        # Type the data cleanly
        email_field.send_keys(email)
        time.sleep(1.0) # Short pause after typing the email
        password_field.send_keys(password)
        time.sleep(1.0) # Short pause after typing the password
        
        login_btn.click()
        print("🔑 Submitted login form. Waiting for authentication...")
        time.sleep(3.0) # Give it 3 full seconds to let the backend authorize and transition the screen

    def logout_helper(self):
        """Visual logout target routine with tracking delays."""
        try:
            print("⏳ Attempting a clean UI log out...")
            logout_btn = self.wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(normalize-space(), 'Log out') or contains(normalize-space(), 'Logout')]")
            ))
            time.sleep(1.5) # Look at the logout button briefly before clicking it
            logout_btn.click()
            self.wait.until(lambda d: d.current_url == f"{self.base_url}/" or "/login" in d.current_url)
        except Exception:
            self.driver.delete_all_cookies()
            self.driver.execute_script("window.localStorage.clear();")
            self.driver.execute_script("window.sessionStorage.clear();")
            self.driver.get(self.base_url)
        
        print("🚪 Logged out cleanly. Pausing before next user switch...")
        time.sleep(2.5) # Substantial pause so the viewer notices the session ended

    # ==================== TEST CASES ====================

    def test_1_public_and_service_routes(self):
        """Vets all marketing pages, main service categories, and underlying sub-service links."""
        print("\n⏳ Testing Public Content & Sub-Service Sub-routes (Slower pacing active)...")
        
        public_urls = [
            f"{self.base_url}/",
            f"{self.base_url}/search",
            f"{self.base_url}/about",
            f"{self.base_url}/contact",
            f"{self.base_url}/faq",
            f"{self.base_url}/services",
            
            # --- Cleaning Category ---
            f"{self.base_url}/services/cleaning",
            f"{self.base_url}/services/cleaning/full-home-deep-cleaning",
            f"{self.base_url}/services/cleaning/office-workspace-cleaning",
            f"{self.base_url}/services/cleaning/kitchen-deep-degreasing",
            f"{self.base_url}/services/cleaning/sofa-upholstery-shampooing",
            f"{self.base_url}/services/cleaning/post-construction-cleaning",
            f"{self.base_url}/services/cleaning/backyard-and-garden-cleaning",
            
            # --- Electrician Category ---
            f"{self.base_url}/services/electrician",
            f"{self.base_url}/services/electrician/complete-house-re-wiring",
            f"{self.base_url}/services/electrician/short-circuit-troubleshooting",
            f"{self.base_url}/services/electrician/ceiling-fan-and-light-installation",
            f"{self.base_url}/services/electrician/air-conditioner-electrical-wiring",
            f"{self.base_url}/services/electrician/smart-home-device-setup",
            f"{self.base_url}/services/electrician/ips-and-generator-maintenance",
            
            # --- Security Category ---
            f"{self.base_url}/services/security",
            f"{self.base_url}/services/security/personal-bodyguard-protection",
            f"{self.base_url}/services/security/night-shift-residential-guard",
            f"{self.base_url}/services/security/commercial-store-security",
            f"{self.base_url}/services/security/private-event-security-guard",
            f"{self.base_url}/services/security/cctv-camera-system-installation",
            f"{self.base_url}/services/security/biometric-access-control-setup",
            f"{self.base_url}/services/security/smart-alarm-infrastructure",
            
            # --- Catering Category ---
            f"{self.base_url}/services/catering",
            f"{self.base_url}/services/catering/wedding-buffet-catering",
            f"{self.base_url}/services/catering/corporate-lunch-catering",
            f"{self.base_url}/services/catering/birthday-party-finger-food",
            f"{self.base_url}/services/catering/private-home-chef-experience",
            f"{self.base_url}/services/catering/barbecue-grill-special",
            f"{self.base_url}/services/catering/religious-festival-feast",
            
            # --- Babysitting Category ---
            f"{self.base_url}/services/babysitting",
            f"{self.base_url}/services/babysitting/full-time-daytime-nanny",
            f"{self.base_url}/services/babysitting/after-school-homework-helper",
            f"{self.base_url}/services/babysitting/weekend-night-babysitter",
            f"{self.base_url}/services/babysitting/infant-care-specialist",
            f"{self.base_url}/services/babysitting/special-needs-child-care",
            f"{self.base_url}/services/babysitting/emergency-on-call-care",
            
            # --- Pet Care Category ---
            f"{self.base_url}/services/pet-care",
            f"{self.base_url}/services/pet-care/dog-walking-and-exercise",
            f"{self.base_url}/services/pet-care/at-home-pet-sitting",
            f"{self.base_url}/services/pet-care/basic-pet-grooming-and-bathing",
            f"{self.base_url}/services/pet-care/overnight-pet-boarding",
            f"{self.base_url}/services/pet-care/pet-vet-appointment-escort",
            f"{self.base_url}/services/pet-care/puppy-training-companion",
            f"{self.base_url}/services/pet-care/aquarium-and-exotic-care"
        ]
        
        self.check_public_urls(public_urls)
        print(f"✔ Test 1: Completed comprehensive public route walkthrough.")

    def test_2_customer_authenticated_routes(self):
        """Logs into User tier and tests all structural routes slowly."""
        print("\n⏳ Authenticating Customer Tier (shakib@gmail.com)...")
        self.login_helper("shakib@gmail.com", "12345678")
        
        customer_paths = [
            "/customer/dashboard", "/customer/profile", "/customer/bookings",
            "/customer/orders", "/customer/wishlist", "/customer/notifications",
            "/customer/payments", "/customer/reviews", "/customer/complaints", "/customer/cart"
        ]
        
        for path in customer_paths:
            full_url = f"{self.base_url}{path}"
            print(f"💻 Dashboard Route: {path}")
            self.driver.get(full_url)
            time.sleep(2.0) # Stay on the dashboard view for 2 seconds
            self.scroll_page_factory()
            self.assertTrue("login" not in self.driver.current_url, f"Auth Rejection! Customer bounced from: {path}")
            
        print("✔ Test 2: Finished Customer interface verification.")
        self.logout_helper()

    def test_3_worker_authenticated_routes(self):
        """Logs into Worker tier and tests all structural routes slowly."""
        print("\n⏳ Authenticating Worker Tier (worker1@worksure.com)...")
        self.login_helper("worker1@worksure.com", "Password123!")
        
        worker_paths = [
            "/worker/dashboard", "/worker/profile", "/worker/documents",
            "/worker/availability", "/worker/services", "/worker/orders",
            "/worker/earnings", "/worker/reviews", "/worker/notifications"
        ]
        
        for path in worker_paths:
            full_url = f"{self.base_url}{path}"
            print(f"👷 Worker Route: {path}")
            self.driver.get(full_url)
            time.sleep(2.0) # Stay on the worker view for 2 seconds
            self.scroll_page_factory()
            self.assertTrue("login" not in self.driver.current_url, f"Auth Rejection! Worker bounced from: {path}")
            
        print("✔ Test 3: Finished Worker interface verification.")
        self.logout_helper()

    def test_4_admin_authenticated_routes(self):
        """Logs into Admin tier and tests all structural routes slowly."""
        print("\n⏳ Authenticating Administrative Portal Tier (admin@worksure.com)...")
        self.login_helper("admin@worksure.com", "Password123!")
        
        admin_paths = [
            "/admin/dashboard", "/admin/users", "/admin/workers",
            "/admin/verify", "/admin/services", "/admin/orders",
            "/admin/payments", "/admin/reviews", "/admin/analytics", "/admin/complaints"
        ]
        
        for path in admin_paths:
            full_url = f"{self.base_url}{path}"
            print(f"🛡️ Admin Route: {path}")
            self.driver.get(full_url)
            time.sleep(2.0) # Stay on the admin control screen for 2 seconds
            self.scroll_page_factory()
            self.assertTrue("login" not in self.driver.current_url, f"Auth Rejection! Admin bounced from: {path}")
            
        print("✔ Test 4: Finished Admin administrative suite verification.")
        self.logout_helper()

if __name__ == "__main__":
    unittest.main()