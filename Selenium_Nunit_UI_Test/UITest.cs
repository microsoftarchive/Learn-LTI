using System;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.IE;
using System.Threading;

namespace Selenium_Nunit_UI_Test
{
    public class UI_test
    {
        private IWebDriver driver;
        private string moodleURL = "https://bitnami-moodle-b65b-ip.uksouth.cloudapp.azure.com/my/";
        private string LTIRegURL = "";
        private string browser = "Chrome";

        [Test]
        public void LoginTest()
        {
            // Access the moodle login page

            driver.Navigate().GoToUrl(moodleURL);
            var ADD_B2C_btn = driver.FindElements(By.ClassName("login-identityprovider-btn"));

            // Choose ADD B2C sign in

            ADD_B2C_btn[1].Click();
            Thread.Sleep(3000);

            // Sign in using a valid tenant account * Mock account required *
            driver.FindElement(By.Id("AD_Signin")).Click();
            Thread.Sleep(3000);

            // Enter mock account email address

            string username = "ucabdhn@w3jnk.onmicrosoft.com";
            string password = "Chilai30101999!";

            // Username

            driver.FindElement(By.TagName("input")).SendKeys(username);
            driver.FindElement(By.Id("idSIButton9")).Click();
            Thread.Sleep(3000);

            // Password

            driver.FindElement(By.Id("i0118")).SendKeys(password);
            driver.FindElement(By.Id("idSIButton9")).Click();
            Thread.Sleep(3000);

            // Click "Yes" on "Stay sign in ?"

            driver.FindElement(By.Id("idSIButton9")).Click();
        }


        [SetUp]
        public void SetupTest()
        {
            switch (browser)
            {
                case "Chrome":
                    driver = new ChromeDriver();
                    break;
                case "Firefox":
                    driver = new FirefoxDriver();
                    break;
                case "IE":
                    driver = new InternetExplorerDriver();
                    break;
                default:
                    driver = new ChromeDriver();
                    break;
            }

        }

        [TearDown]
        public void MyTestCleanup()
        {
            driver.Quit();
        }

    }
}
