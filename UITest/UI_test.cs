using System;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.IE;
using System.Threading;

namespace SeleniumTests
{
    /// <summary>
    /// Summary description for MySeleniumTests
    /// </summary>
    [TestClass]
    public class UI_test
    {
        private IWebDriver driver;
        private string moodleURL = "https://bitnami-moodle-b65b-ip.uksouth.cloudapp.azure.com/my/";
        private string LTIRegURL = "";
        private string browser = "Chrome";

        [TestMethod]
        [TestCategory("Chrome")]
        public void LoginTest()
        {
            // Access the moodle login page
            
            driver.Navigate().GoToUrl(moodleURL);
            var ADD_B2C_btn = driver.FindElements(By.ClassName("login-identityprovider-btn"));

            // Choose ADD B2C sign in
            
            ADD_B2C_btn[1].Click();
            Thread.Sleep(6000);

            // Sign in using a valid tenant account * Mock account required *
            driver.FindElement(By.Id("AD_Signin")).Click();
            Thread.Sleep(6000);

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
            Thread.Sleep(4000);

            // Click "Yes" on "Stay sign in ?"
            
            driver.FindElement(By.Id("idSIButton9")).Click();
            Thread.Sleep(4000);
        }


        [TestInitialize()]
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

        [TestCleanup()]
        public void MyTestCleanup()
        {
            driver.Quit();
        }

    }
}

//[TestMethod]
//[TestCategory("Chrome")]
//public void TheBingSearchTest()
//{
//    driver.Navigate().GoToUrl(appURL + "/");
//    driver.FindElement(By.Id("sb_form_q")).SendKeys("Azure Pipelines");
//    driver.FindElement(By.Id("sb_form_go")).Click();
//    driver.FindElement(By.XPath("//ol[@id='b_results']/li/h2/a/strong[3]")).Click();
//    Assert.IsTrue(driver.Title.Contains("Azure Pipelines"), "Verified title of the page");
//}