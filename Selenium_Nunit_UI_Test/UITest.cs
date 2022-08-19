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
        private string[] user_types = { "student", "lecturer" };

        public void Login(string user_type)
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
            string username = "";
            string password = "";

            switch (user_type)
            {
                case "lecturer":
                    username = "ucabdhn@w3jnk.onmicrosoft.com";
                    password = "Chilai30101999!";
                    break;
                case "student":
                    username = "ucabdhn@w3jnk.onmicrosoft.com";
                    password = "Chilai30101999!";
                    break;
                default:
                    username = "ucabdhn@w3jnk.onmicrosoft.com";
                    password = "Chilai30101999!";
                    break;
            }

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
        [Test]
        public void LoginTest()
        {
            // Login as admin
            Login(user_types[0]);
        }

        [Test]
        public void CreateAssignmentTest()
        {
            Login(user_types[1]);
            Thread.Sleep(3000);

            // Choose My Course tab
            var Tabs = driver.FindElements(By.CssSelector("a[role='menuitem']"));
            Thread.Sleep(3000);

            Tabs[2].Click();
            Thread.Sleep(3000);

            // Click on course
            var Courses = driver.FindElements(By.CssSelector("span[class='multiline']"));

            foreach(var course in Courses)
            {
                if(course.Text == "Selenium_Test_Course")
                {
                    course.Click();
                    break;
                }
            }
            Thread.Sleep(1000);

            // Toggle Edit mode
            driver.FindElement(By.CssSelector("input[name='setmode']")).Click();
            Thread.Sleep(1000);

            // Add new assignment
            driver.FindElements(By.CssSelector("span[class='activity-add-text']"))[0].Click();
            Thread.Sleep(3000);
        }

        [Test]
        public void InternalStudentAccessAssignmentTest()
        {
            Login(user_types[0]);
            Thread.Sleep(2000);

            // Choose My Course tab
            var Tabs = driver.FindElements(By.CssSelector("a[role='menuitem']"));
            Thread.Sleep(2000);

            Tabs[2].Click();
            Thread.Sleep(2000);

            // Click on course
            var Courses = driver.FindElements(By.CssSelector("span[class='multiline']"));

            foreach(var course in Courses)
            {
                if(course.Text == "Selenium_Test_Course")
                {
                    course.Click();
                    break;
                }
            }
            Thread.Sleep(2000);

            // Click on an assignment
            var Assignments = driver.FindElements(By.CssSelector("span[class='instancename']"));

            foreach(var assignment in Assignments)
            {
                if(assignment.Text.Contains("Test_Assignment"))
                {
                    assignment.FindElement(By.XPath("..")).Click();
                    break;
                }
            }
            Thread.Sleep(10000);

            // Switch to LTI login window
            driver.SwitchTo().Window(driver.WindowHandles[1]);

            // Click on the AD Signin
            var LoginButtons = driver.FindElements(By.CssSelector("button[class='accountButton']"));
            LoginButtons[1].Click();
            Thread.Sleep(10000);
        }


        [SetUp]
        public void SetupTest()
        {
            // Choose browser
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

            // Setup mock data using PS 

            // Setup 2 accounts in same tenant

            // Setup 2 accounts in different tenant

            // Signup the 4 accounts on moodle

        }

        [TearDown]
        public void MyTestCleanup()
        {
            driver.Quit();
        }

    }
}
