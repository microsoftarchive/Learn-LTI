# Frequently Asked Questions

### Issues in deployment

In order to understand the issue in more detail, one way could be to go through the deployment details which could be accessed via Azure Portal. Double check the setting with 
[the deployment guide](/docs/DEPLOYMENT_GUIDE.md)

Go to Azure Portal -> Choose appropriate Subscription -> Select Resource Groups blade from Left Rail -> Choose appropriate Resource Group -> Select Deployments Blade from Left Rail.

The deployment step which failed should be easily identified and debugged.

If the error is related to an Azure region please try to redeploy to a suitable alternative region.

If the error is related to missing subscription registration please make sure the following resource providers are registered in your subscription - 
- Microsoft.Web
- Microsoft.Storage
- Microsoft.Insights
- Microsoft.KeyVault
- Microsoft.Authorization

To see the registration status and register a resource provider namespace see [Resolve errors for resource provider registration](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/error-register-resource-provider#solution-3---azure-portal)

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

## Cost Management
The cost of the service implementation is approximately $20 per month for the Azure infrastructure which is required for the Microsoft Learn LTI Application. Costs can be assessed by using the [Azure Pricing Calculator]( https://azure.microsoft.com/pricing/calculator)

## What do you need to deploy the Microsoft Learn LTI Application
Your Instititution will need to have 
- Azure tenant 
- Azure Subscription 
- Azure Active Directory for user Authentication

## What LTI data will be passing from the LMS into Learn…
We are only user membership service within LTI. We are using the membership service to gain a list of members of the course to surface in the Learn LTI Application. All Data resides in the institution as the Learn LTI Application is installed within your Azure Tenant. We are not transferring anything to MS Learn or from MS Learn to the institutional LMS see the [Architecure Diagram.](ARCHITECTURE_OVERVIEW.md)

## How can we track user Microsoft Learn. 
A user/student will login to Microsoft Learn using their Org AAD/microsoft365  user reporting to the institution is provided to only their Org account and this is done securly and we don't hold user details these are reconciled by the institution using Azure Data Services and [Microsoft Learn Organizational Reporting](https://docs.microsoft.com/en-us/learn/support/org-reporting)

## Will the LTI be sharing gradebook or assessment data? 
At this point Microsoft Learn does not support LTI Gradebook passback. Therefore your institution need to build a manual process for assessment of completed works. 

## Azure Compliance 
90 compliance certifications, including over 50 specific to global regions and countries, such as the US, the European Union, Germany, Japan, the United Kingdom, India, and China. And, get more than 35 compliance offerings specific to the needs of key industries, including health, government, finance, education, manufacturing, and media. Your emerging compliance needs are covered, too: Microsoft engages globally with governments, regulators, standards bodies, and non-governmental organizations. Explore [Azure compliance](https://docs.microsoft.com/en-us/compliance/regulatory/offering-home) you can find more details on [compliance](https://azure.microsoft.com/en-us/overview/trusted-cloud/compliance/)

## FERPA-protected Data
Microsoft only validate the users/students to Microsoft Learn using their microsoft365/AAD usernames we store no other details related to the user apart from there login. It is the institution responsibility and reconcile users activity using the [Microsoft Learn Organizational Reporting](https://docs.microsoft.com/en-us/learn/support/org-reporting) the institition can build associated activity reports around there users/students. Again as the Learn LTI Application is installed, managed and operated by the Institution we recommend you read [this paper](https://azure.microsoft.com/en-us/resources/microsoft-azure-ferpa-implementation-guide/) as its helpful to those in educational organizations who need guidance and best practices in designing secure solutions on Azure. 

## Public Health/HIPAA PCI/DSS as FISMA 
The requirements are out of scope for Microsoft Learn. 

## Microsoft Professional Certifications
The purchasing of Microsoft Certification is processed via a learning partner as is the certification process and exam which sits outside of MS Learn API feature as we are simply bringing back modules, learning paths at this point. 
For [non-students interested in technology](https://examregistration.microsoft.com/)
For [students or instructors](http://www.certiport.com/locator)

## Help with setting up the Microsoft Learn LTI Application 
We know many academic institutions may need help installing the [Microsoft Learn LTI Application](https://github.com/microsoft/Learn-LTI/blob/main/README.md) at your institution. 

Microsoft and [Upwork](https://www.upwork.com/ppc/microsoft/azure/) have partnered to provide a curated talent pool of freelancers that have excellent customer ratings on Upwork and are verified by Microsoft to hold Azure certifications. These freelancers can provide assistance on a wide variety of Azure projects large and small. We have provided specific training to them on the Microsoft Learn LTI Application so they are well versed on installation requirements.

If you would like support, here’s how to get started:

-	Email [Learn LTI](mailto:learnlti@microsoft.com.) to express your interest 
-	You will be assisted in creating a job post on Upwork’s platform for a freelancer to undertake the setup and installation.
-	Within a few hours to a couple days, qualified freelancers will bid on your project
-	Installation should only take 2-3 hours and cost anywhere from $150 - $300. Note: freelancers set their own rates so you should choose a free lancer based on cost and their experience)
-	Once you accept a bid and hire a freelancer you’ll be on your way
