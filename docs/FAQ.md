# Frequently Asked Questions

## Deployment

[See the deployment guide](DEPLOYMENT_GUIDE.MD)

### Issues in deployment

In order to understand the issue in more detail, one way could be to go through the deployment details which could be accessed via Azure Portal.

Go to Azure Portal -> Choose appropriate Subscription -> Select Resource Groups blade from Left Rail -> Choose appropriate Resource Group -> Select Deployments Blade from Left Rail.

The deployment step which failed should be easily identified and debugged.

If the error is related to an Azure region please try to redeploy to a suitable alternative region.

If the error is related to missing subscription registration please make sure the following resource providers are registered in your subscription - 
- Microsoft.Web
- Microsoft.Storage
- Microsoft.Insights
- Microsoft.KeyVault
- Microsoft.Authorization

You can see the registration status and register a resource provider namespace by following this [documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/error-register-resource-provider#solution-3---azure-portal)

### Unathorized 401 Error

An Unauthorized (401) Exception occurred when access the Moodle's LTI services.

```
/mod/lti/services.php/CourseSection/39/bindings/2/memberships
```

This problem is related to your current Apache Config.

[Apache Configuration Solution](https://moodle.org/mod/forum/discuss.php?d=389429)

### I see a message saying "Loading assignment"

We have seen this case where the Authorization header was not being forwarded to the backend hosted on AWS CloudFront.

To resolve this see [Configure CloudFront to Forward Authorization Headers](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html#add-origin-custom-headers-forward-authorization)

## Reporting

Microsoft Learn organizational Reporting is a service available to organizations to view Microsoft Learn training progress and achievements of the individuals within their tenant. This service is available to both enterprise customers and educational organizations.The system uses a service called Azure Data Share to extract, transform, and load (ETL) user progress data into data sets, which can then be processed further or displayed in visualization tools such as Power BI. Data sets can be stored to either Azure Data Lake, Azure Blob storage, Azure SQL database, or Azure Synapse SQL Pool. Organizations can create and manage their data share using Azure Data Share’s no-code UI.
[Learn Organizational Reporting setup](https://docs.microsoft.com/en-us/learn/support/org-reporting)

## Active Directory

### Moodle 

OpenID Connect Authentication Plugin
The OpenID Connect plugin provides single-sign-on functionality using configurable identity providers, including Azure Active Directory. It is used as part of the Office 365 suite of plugins to connect to Azure Active Directory, but can be configured to provide SSO for other OpenID Connect providers as well.
This is part of the suite of [Office 365 plugins for Moodle](https://moodle.org/plugins/browse.php?list=set&id=72)
To follow active development on [o365 Moodle Microsoft GitHub](https://github.com/Microsoft/o365-moodle/)

### Canvas 
How to integrate Canvas with Azure Active Directory (Azure AD). Integrating Canvas with Azure AD provides you with the following benefits:
You can control in Azure AD who has access to Canvas.
You can enable your users to be automatically signed-in to Canvas (Single Sign-On) with their Azure AD accounts.
You can manage your accounts in one central location - the Azure portal.
[Tutorial: Azure Active Directory integration with Canvas](https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/canvas-lms-tutorial)

### Blackboard 
How to integrate Blackboard Learn with Azure Active Directory (Azure AD). When you integrate Blackboard Learn with Azure AD, you can:
Control in Azure AD who has access to Blackboard Learn.
Enable your users to be automatically signed-in to Blackboard Learn with their Azure AD accounts.
Manage your accounts in one central location - the Azure portal.
[Tutorial: Azure Active Directory single sign-on integration with Blackboard Learn](https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/blackboard-learn-tutorial)

## Troubleshooting

### Azure Function Traces

This should provide details related to the execution context and state of the function execution when it has returned http 204 error.

- Goto your Resource Group inside Azure and select Function App matching users-XXXXXXX.
- Select Functions Blade in Left Hand Pane.
- Select GetUserDetails afterwards.
- Choose Monitor Blade in LHP and you should see the Invocation Traces.
- Clicking on the failing trace should provide more details related to Server logs for that function invocation to help you.

### Failures (Exceptions) in App Insights

Go to your Resource Group in the [Azure Portal](http://portal.azure.com) and select Application Insights resource matching users-XXXXXXX.

Select Failures Blade in LHP and then choose Exceptions Tab.

The subsequent screen should indicate any exceptions that were thrown as a part of function execution and should provide more insights into what may have gone wrong on server when executing GetUserDetails api.

If you encounter errors which you are unable to debug we request you to please share the above details with us in order for us to be able to help you in a better way.

Since the details might contain some private information as well. Please feel free to reach out to us via email at learnlti@microsoft.com.

### Failure is in Users Function App

Function app which is not being able to find the user (signed-in via AAD) enrolled into the current course. 

Please check that the return code for the API in the Chrome DevTools network tab is http204 (i.e. No-Content).

In our experience, the only case when this happens is when user signs into Learn-LTI app with an onmicrosoft.com account which does not map to the email of any of the enrolled users of the course.

## Configuration

if you receive the following error.

![Learnltiadd](../images/LearnLTIAADIssue.png)

Ensure you are using an Azure AD connected account,

Please ensure that AAD sign for your LMS is enabled and you are signing into your LMS with a AAD account.

## Educator

The cost of the service implementation is approximately $20 per month for the Azure infrastructure which is required for the Microsoft Learn LTI Application
Costs can be assessed by using the [Azure Pricing Calculator]( https://azure.microsoft.com/pricing/calculator)

## Help with setting up the Microsoft Learn LTI Application 

We know many academic institutions may need help installing the [Microsoft Learn LTI Application](https://github.com/microsoft/Learn-LTI/blob/main/README.md) at your institution. 

Microsoft and [Upwork](https://www.upwork.com/ppc/microsoft/azure/) have partnered to provide a curated talent pool of freelancers that have excellent customer ratings on Upwork and are verified by Microsoft to hold Azure certifications. These freelancers can provide assistance on a wide variety of Azure projects large and small. We have provided specific training to them on the Microsoft Learn LTI Application so they are well versed on installation requirements.

If you would like support, here’s how to get started:

-	Email [Learn LTI](mailto:learnlti@microsoft.com.) to express your interest 
-	You will be assisted in creating a job post on Upwork’s platform for a freelancer to undertake the setup and installation.
-	Within a few hours to a couple days, qualified freelancers will bid on your project
-	Installation should only take 2-3 hours and cost anywhere from $150 - $300. Note: freelancers set their own rates so you should choose a free lancer based on cost and their experience)
-	Once you accept a bid and hire a freelancer you’ll be on your way

