# Architecture Overview


![Architecture Overview](/images/Architecture.Overview.png)


The Microsoft Learn LTI Application pairs Institutional LMSs courses/modules with Microsoft Learn's Catalog API that connects students to Microsoft Learn content.

**Here’s a breakdown of the key parts of Microsoft Learn LTI Application.**
* **AAD** - Azure Active Directory is a multi-tenant, cloud-based identity and access management service. What this service does in the context of Enda is provide single sign-on and multi-factor authentication so that students do no have to sign into their university and Microsoft and make sure their access is secure.
* **Connect** - Provides endpoints between LMS v1.1 - 1.3 and Microsoft Learn LTI Application and Azure. Connect verifies Azure calls and serves as the management pipeline to Azure endpoints.
* **Backend** - Makes the Azure calls to Microsoft Learn Catalog APIs and updates Storage.
* **Storage** – Stores assignment information and tracks student progress with modules and callback URLs and does not store any personal student information.

# Backend Infrastructure


![Backend Infrastructure](/images/Architecture.Backend.png)


**The LTI call (with OAuth) does 4 things:**
1. Calls system information to save course and assignment details.
2. OAuth authenticates a user.
3. Assignment information gets updated.
4. User information gets called.
   * Only saves callback URLs to get info about the user from the LMS.

**HTTP Redirect to Microsoft Learn LTI Application web client**
* Using the assignment information, generated a specific URL for the assignment.
* From that point, the Microsoft Learn LTI Application Connect endpoint no longer participates in the operation.
* The LMS stops participating in the process in a direct way. Only a few calls are made by the Microsoft Learn LTI Application backend to the LMS to get information.

**Managed Identity**

Consists of different API calls
*	Using the registered app in the AAD and the Microsoft Authentication Library, the client makes secure calls to the backend.
*	The authentication happens on the cloud network level.
*	The login happens using the standard Microsoft SSO login flow.
