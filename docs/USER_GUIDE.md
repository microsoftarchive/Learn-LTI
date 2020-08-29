# Educator Guide

### In this guide we cover how to:
- Create an assignment in a course leveraging Microsoft Learn LTI application
- Customize, Review, and Publish the assignment

By now, you should already configured the Learn LTI application in your LMS. If not, follow the [configuration guide](./CONFIGURATION_GUIDE.md) to configure the tool before continuing below.

The steps for creating an assignment are slightly different depending on the LMS you are using. The following examples show how to create assignment leveraging Learn LTI application with three of the popular LMS.

- [Moodle](#Create-an-assignment-in-Moodle-leveraging-Microsoft-Learn-LTI-application)
- [Canvas](#Create-an-assignment-in-Canvas-leveraging-Microsoft-Learn-LTI-application)
- [Blackboard](#Create-an-assignment-in-Blackboard-leveraging-Microsoft-Learn-LTI-application)

### If you have issues with this guide or with our tool please:
- Raise a [GitHub issue](https://github.com/microsoft/Learn-LTI/issues/new?WT.mc_id=learnlti-github-cxa)

> The teams at Microsoft hope you love using the LTI tool! Thank you for teaching our future!

## Create an assignment in Moodle leveraging Microsoft Learn LTI application

1. Go to a course in your Moodle LMS.
2. Click **Turn editing on**.
3. Click **Add a new activity or resource**. 
![UserGuide1](/images/UserGuide.1.PNG)
4. Select **External Tool**.
![UserGuide2](/images/UserGuide.2.PNG)
5. Enter the following information:
   * **Activity name**: give the assignment a name of your choice.
   * **Preconfigured tool**: select the name of the tool you configured during deployment and configuration.
![UserGuide3](/images/UserGuide.3.PNG)
7. Click **Save and return to course**. You will see the assignment created as an LTI link. 
6. Click the LTI link and [configure](#Customize-Review-and-Publish-the-assignment) the assignment.

## Create an assignment in Canvas leveraging Microsoft Learn LTI application

1. Go to a course in your Canvas LMS (Users who want to add an LTI Advantage tool to a course must have the **LTI - add / edit / delete** permission).
2. Select **Assignments** from the left sidebar.
3. Click on **+Assignment** to add a new assignment.
4. Enter assignment name and other details.
5. Select **Submission Type** as **External Tool**.
![UserGuide.Canvas.1](/images/UserGuide.Canvas.1.png)
6. Select **Load This Tool In A New Tab**.
7. Click **Find**.
8. Select the name of the tool you configured during deployment and configuration and click **Select**.
9. Fill the rest of the assignment details as per your requirement.
10. Click **Save**. You will see the assignment created as an LTI link.
11. Click the LTI link and [configure](#Customize-Review-and-Publish-the-assignment) the assignment.

## Create an assignment in Blackboard leveraging Microsoft Learn LTI application

1. Go to a course in your Blackboard LMS (Users who want to add an LTI Advantage tool to a course must have the **Instructor** role).
2. Click on the 3 dots on the right.
3. Click **Import Content**.
![UserGuide.Blackboard.1](/images/UserGuide.Blackboard.1.png)
4. Click **Content Market**.
![UserGuide.Blackboard.2](/images/UserGuide.Blackboard.2.png)
5. Locate the label for the Learn LTI tool and click the **+** icon. You will see the assignment created as an LTI link.
6. Click the LTI link and [configure](#Customize-Review-and-Publish-the-assignment) the assignment.

## Customize, Review, and Publish the assignment

These steps are performed within the Microsoft Learn LTI application, and they are LMS agnostic.

1. Click on the LTI link that you have just added to launch an instance of the Learn LTI tool. 
2. Locate the **General** tab under **Configuration**.
3. Enter the following information:
   * **Description**: Include a brief overview of the assignment and key learning objectives for your students.
   * **Deadline**: Use the calender to enter when you expect students to have completed the assignment.
   * **Add Link**: Include links to external sites and sources of information that you believe will help the students to gain more from the assignment.
![General](/images/Configuration.General.PNG)
4. Click the **MS Learn** under **Configuration**.   
![Tutorial](/images/Configurations.Tutorial.ClickBubble.png)
5. From the MS Learn tab, you can search for learning paths and modules from Microsoft Learn to add to your assignment.
6. Select the learning paths and modules you want to add to your assignment. 
![Tutorial.Path](/images/Configurations.Tutorial.Path.png)
7. On the left hand side, under **View**, click **Preview**.
8. Review the assignment to make sure it works as intended.
![Preview](/images/View.Preview.PNG)
9. Under **View**, click **Publish**.
![Publish](/images/View.Preview.Publish.png)
10. A pop-up window will appear asking you to confirm that you wish to publish the assignment. Click the **Publish** button.
