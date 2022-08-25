using System;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.IE;
using System.Threading;
using OpenQA.Selenium.Support.UI;
using System.Collections.Generic;

namespace Selenium_Nunit_UI_Test
{
    public class UI_test
    {
        private IWebDriver driver;

        // Link to the moodle site that is used for testing

        private string moodleURL = "https://bitnami-moodle-b65b-ip.uksouth.cloudapp.azure.com/my/";

        // Browser to be used for testing

        private string browser = "Chrome";

        // List of user types to be used for testing

        private string[] user_types = { "student", "teacher", "external_student", "external_teacher" };

        // Name of course that is used for testing

        private string test_course_name = "Selenium_Test_Course";

        // Name of the assignment to be created and used for testing

        private string test_assignment_name = "Test_assignment_";

        // Name of a deployed LTI tool

        private string LTI_tool_name = "RB_luke-1.3";


        // Login wrapper method

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
                case "teacher":
                    username = "test_teacher@uclmsclearnlti.onmicrosoft.com";
                    password = "qwerty1234/.,/.,";
                    break;
                case "student":
                    username = "test_student@uclmsclearnlti.onmicrosoft.com";
                    password = "qwerty1234/.,/.,";
                    break;
                case "external_teacher":
                    username = "external_test_teacher@w3jnk.onmicrosoft.com";
                    password = "qwerty1234/.,/.,";
                    break;
                case "external_student":
                    username = "external_test_student@w3jnk.onmicrosoft.com";
                    password = "qwerty1234/.,/.,";
                    break;
                default:
                    username = "test_student@uclmsclearnlti.onmicrosoft.com";
                    password = "qwerty1234/.,/.,";
                    break;
            }

            // Input Username

            driver.FindElement(By.TagName("input")).SendKeys(username);
            Thread.Sleep(3000);
            driver.FindElement(By.Id("idSIButton9")).Click();
            Thread.Sleep(3000);

            // Input Password

            driver.FindElement(By.Id("i0118")).SendKeys(password);
            Thread.Sleep(3000);
            driver.FindElement(By.Id("idSIButton9")).Click();
            Thread.Sleep(6000);

            // Click "Yes" on "Stay sign in ?"

            if (user_type.Contains("external_"))
            {
                // More info required dialog box

                driver.FindElement(By.Id("idSubmit_ProofUp_Redirect")).Click();
                Thread.Sleep(15000);

                // Find skip button 

                var skip_button = driver.FindElements(By.TagName("a"));
                foreach (var link in skip_button)
                {
                    if (link.Text.Contains("Skip setup"))
                    {
                        link.Click();
                        Thread.Sleep(15000);
                        driver.FindElement(By.Id("idSIButton9")).Click();
                        Thread.Sleep(15000);
                        break;
                    }
                }
            }
            else
            {
                driver.FindElement(By.Id("idSIButton9")).Click();
                Thread.Sleep(5000);
            }

        }


        // Student/Teacher Authentication test

        [Test, Order(1)]
        [TestCase("student")]
        [TestCase("teacher")]
        [TestCase("external_student")]
        [TestCase("external_teacher")]
        public void LogintAuthenticationTest(string user_type)
        {
            // Login as student

            Login(user_type);
            bool successful_signin = false;
            var titles = driver.FindElements(By.TagName("h2"));
            Thread.Sleep(3000);
            foreach (var title in titles)
            {
                if (title.Text.Contains("Welcome back,"))
                {
                    successful_signin = true;
                    break;
                }
            }
            Thread.Sleep(3000);
            Assert.IsTrue(successful_signin);
        }


        // Create assingment test

        [Test, Order(2)]
        [TestCase("teacher")]
        [TestCase("external_teacher")]
        public void CreateAssignmentTest(string usertype)
        {
            // Login as teacher
            
            Login(usertype);
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
                if(course.Text == test_course_name)
                {
                    course.Click();
                    break;
                }
            }
            Thread.Sleep(3000);

            // Toggle Edit mode
            
            driver.FindElement(By.CssSelector("input[name='setmode']")).Click();
            Thread.Sleep(3000);

            // Add new assignment

            driver.FindElements(By.CssSelector("span[class='activity-add-text']"))[0].Click();
            Thread.Sleep(3000);
            driver.FindElement(By.CssSelector("a[title='Add a new External tool']")).Click();
            Thread.Sleep(3000);

            // Fill in tools

            driver.FindElement(By.Id("id_name")).SendKeys(test_assignment_name + DateTime.Now.ToString("yyyyMMddHHmmss"));
            var selectElement = new SelectElement(driver.FindElement(By.Id("id_typeid")));
            selectElement.SelectByText(LTI_tool_name);

            Thread.Sleep(3000);
            driver.FindElement(By.Id("id_submitbutton2")).Click();

            // Check if assingment is created

            Thread.Sleep(3000);
            var All_Assignment = driver.FindElements(By.CssSelector("span[class='instancename']"));
            bool assignment_created = false;
            foreach (var assignment in All_Assignment)
            {
                if (assignment.Text.Contains(test_assignment_name))
                {
                    assignment_created = true;
                    break;
                }
            }

            Assert.IsTrue(assignment_created);
        }

        //  Access assingment test

        [Test, Order(3)]
        [TestCase("student")]
        [TestCase("external_student")]
        public void AccessAssignmentTest(string usertype)
        {
            // Login as teacher

            Login(usertype);
            Thread.Sleep(10000);

            // Choose My Course tab

            var Tabs = driver.FindElements(By.CssSelector("a[role='menuitem']"));
            Thread.Sleep(2000);

            Tabs[2].Click();
            Thread.Sleep(2000);

            // Click on course

            var Courses = driver.FindElements(By.CssSelector("span[class='multiline']"));

            foreach (var course in Courses)
            {
                if (course.Text == test_course_name)
                {
                    course.Click();
                    break;
                }
            }
            Thread.Sleep(2000);

            // Click on an assignment

            var Assignments = driver.FindElements(By.CssSelector("span[class='instancename']"));

            foreach (var assignment in Assignments)
            {
                if (assignment.Text.Contains(test_assignment_name))
                {
                    assignment.FindElement(By.XPath("..")).Click();
                    break;
                }
            }
            Thread.Sleep(25000);

            // Switch to LTI login window

            driver.SwitchTo().Window(driver.WindowHandles[1]);

            if (usertype.Contains("external_"))
            {
                // More info required dialog box

                driver.FindElement(By.Id("idSubmit_ProofUp_Redirect")).Click();
                Thread.Sleep(7000);

                // Find skip button 

                var skip_button = driver.FindElements(By.TagName("a"));
                foreach (var link in skip_button)
                {
                    if (link.Text.Contains("Skip setup"))
                    {
                        link.Click();
                        Thread.Sleep(3000);
                        break;
                    }
                }
            }
            Thread.Sleep(7000);
        }

        [Test, Order(4)]
        [TestCase("teacher")]
        public void DeletionTest(string usertype)
        {
            // Login as teacher

            Login(usertype);
            Thread.Sleep(10000);

            // Choose My Course tab

            var Tabs = driver.FindElements(By.CssSelector("a[role='menuitem']"));
            Thread.Sleep(3000);

            Tabs[2].Click();
            Thread.Sleep(3000);

            // Click on course

            var Courses = driver.FindElements(By.CssSelector("span[class='multiline']"));

            foreach (var course in Courses)
            {
                if (course.Text == "Selenium_Test_Course")
                {
                    course.Click();
                    break;
                }
            }
            Thread.Sleep(3000);

            // Toggle Edit mode

            driver.FindElement(By.CssSelector("input[name='setmode']")).Click();
            Thread.Sleep(3000);

            // Find assignment to delete

            driver.SwitchTo().Window(driver.WindowHandles[0]);
            var test_assignment_to_delete = driver.FindElements(By.CssSelector("div[class='activity-item ']"));
            var assignment_positions = new List<int>(); ;
            var assignment_id_offset = 2;
            for (int i = 0; i < test_assignment_to_delete.Count; i++)
            {
                if (test_assignment_to_delete[i].GetAttribute("data-activityname").Contains(test_assignment_name))
                {
                    assignment_positions.Add(i + assignment_id_offset);
                }
            }
            Thread.Sleep(2000);

            // Delete all test assignments

            foreach (var position in assignment_positions)
            {
                driver.FindElement(By.Id($"action-menu-toggle-{position}")).Click();
                var options = driver.FindElement(By.Id($"action-menu-{position}")).FindElements(By.TagName("a"));
                options[options.Count - 1].Click();
                driver.SwitchTo().ActiveElement();
                Thread.Sleep(1500);
                driver.FindElement(By.XPath("//button[contains(text(),'Yes')]")).Click();
                Thread.Sleep(1500);
            }

        }


        // Test setup

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

        }


        // Test cleanup

        [TearDown]
        public void MyTestCleanup()
        {
            // Quit test

            driver.Quit();
        }

    }
}
