# Configure the tool

The following guide shows the steps to configure several popular LMS to work with the Microsoft Learn LTI application. If your LMS is not listed here, consult your LMS vendor on how to configure LTI application. Regardless of the LMS, the typical workflow should remain the same:

1. Obtain parameters from the deployed Microsoft Learn LTI application’s registration page
2. Configure an LTI tool on the LMS using the parameters from step 1.
3. Obtain parameters from the configured LTI tool.
4. Configure the Microsoft Learn LTI application using the parameters from step 3.

By now, you should've obtained the following parameters from the Microsoft Learn LTI application’s registration page. If not, follow the [deployment guide](./DEPLOYMENT_GUIDE.md) to deploy Microsoft Learn LTI application and obtain the following parameters from the registration page.

- Login URL
- Launch URL
- Domain URL
- Public Key
- Public JWK
- Public JWK Set URL

If you are not the one who deployed the application, you need to obtain the parameters from that person.

The configuration steps slightly differ depending on the LMS you are using. In general, they will involve registering the Microsoft Learn LTI application as an external tool in the LMS and registering the parameters of external tool back in the Microsoft Learn LTI application's registration page. The following examples show how to configure Microsoft Learn LTI application with three of the popular LMS.

- [Moodle](#Moodle-LMS)
- [Canvas](#Canvas-LMS)
- [Blackboard](#Blackboard-Learn-LMS)

## Moodle LMS

The following steps show how to configure an LTI tool on a Moodle LMS.

### LTI 1.1
1. Open your LMS and sign in with the admin account.
2. Click **Site administration** from the left navigation pane.
3. Select **Plugins**.
4. Under **Activity modules**, click **Manage tools**.
5. Click **configure a tool manually**.
6. Enter the following information:
 * **Tool name**: give the tool a name of your choice. For example: "Microsoft Learn".
 * **Tool URL**: https://[lti-domain-url]/api/launch-lti1 where [lti-domain-url] is the Domain URL field from Microsoft Learn LTI application’s registration page. 
 * **LTI version**: LTI 1.0/1.1
 * **Consumer key**: LearnLTI
 * **Shared secret**: LearnLTI
 * **Default launch container**: New window
7. Under **Services**, **IMS LTI Names and Role Provisioning**: select **Use this service to retrieve members’ information as per privacy settings**.
8. Under **Privacy**, select the following options:
 * **Share launcher’s name with tool**: Always
 * **Share launcher’s email with tool**: Always
 * **Accept grades from the tool**: Always
9. Click **Save changes**. The tool should now appear and listed with the name you provided. 

### LTI 1.3
1. Open your LMS and sign in with the admin account.
2. Click **Site administration** from the left navigation pane.
![Config.1](/images/Config.1.PNG)
3. Select **Plugins**.
![Config.2](/images/Config.2.PNG)
4. Under **Activity modules**, click **Manage tools**.
![Config.3](/images/Config.3.PNG)
5. Click **configure a tool manually**.
![Config.4](/images/Config.4.png)
6. Enter the following information:
 * **Tool name**: give the tool a name of your choice. For example: "Microsoft Learn".
 * **Tool URL**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page  Microsoft Learn LTI application’s registration page.
 * **LTI version**: LTI 1.3
 * **Public key type**: Keyset URL
 * We recommend to use the **Keyset URL** as the **Public Key type**. 
 * **Public keyset**: enter "Public JWK Set URL" from the Microsoft Learn LTI application’s registration page.
 * If you select **RSA key**, instead of **Keyset URL**, as **Public key type**, you can enter the "Public Key" from the Microsoft Learn LTI application's registration page instead of the "Public JWK Set URL". 
 * **Initiate login URL**: enter "Login URL" from the Microsoft Learn LTI application’s registration page.
 * **Redirection URI(s)**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page.
 * **Default launch container**: New window
![Config.5](/images/Config.5.png)
![Config.6](/images/Config.6.png)
7. Under **Services**, **IMS LTI Names and Role Provisioning**: select **Use this service to retrieve members’ information as per privacy settings**.
![Config.8](/images/Config.8.png)
8. Under **Privacy**, select the following options:
 * **Share launcher’s name with tool**: Always
 * **Share launcher’s email with tool**: Always
 * **Accept grades from the tool**: Always
![Config.9](/images/Config.9.png)
9. Click **Save changes**. The tool should now appear and listed with the name you provided. 
10.	Click the icon on the tool that represent **View configuration details**.
![Config.12](/images/Config.12.PNG)
11. Take note of the following parameters:
 * Platform ID
 * Client ID
 * Public keyset URL
 * Access token URL
 * Authentication request URL
12.	Continue to configure the Microsoft Learn LTI application, by registering the parameters back in the Learn LTI application's registration page.

The following steps show how to register the parameters back in the Learn LTI application's registration page. 
> **Note:** For LTI 1.1, this step is not required. If you are not the one who deployed the application, you need to provide these parameters to that person.

1. Open the tool registration page from your browser.
2. Enter the following information:
 * **Display name**: give the tool a name of your choice. 
 * **Issuer**: enter "Platform ID" from the LTI tool configuration details, from the Moodle LMS.
 * **JWK Set URL**: enter "Public keyset URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Access Token URL**: enter "Access token URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Authorization URL**: enter "Authentication request URL" from the LTI tool configuration details, from the Moodle LMS.
 * **Client ID**: enter "Client ID" from the LTI tool configuration details, from the Moodle LMS.
![Config.11](/images/Config.11.png)
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**.

You're all set. The Learn LTI tool is now configured on your Moodle LMS and your Educators will be able to use it to bring Microsoft Learn content to their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Learn LTI tool.

## Canvas LMS

The following steps show how to configure an LTI tool on a Canvas LMS.

### LTI 1.1

At this time, we do not support LTI 1.1 with Canvas LMS.
 
### LTI 1.3

The LTI 1.3 and LTI Advantage platform requires a tool to be initially configured in the Developer Keys page, followed by being added to an account or course. First, configure the tool in the Developer Keys page.

1. Open your LMS and sign in with the admin account (Users who want to manage Developer Keys must have the **Developer Keys - manage** permission).
2. Click **Admin** from the left navigation pane, then click the name of the account.
3. Click **Developer Keys**.
4. Click **+Developer Key** and click **+LTI Key**.
5. Enter the following information:
 * **Key Name**: give the tool a name of your choice. For example: "Microsoft Learn".
 * **Redirection URIs**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page. 
 * **Method**: select **Manual Entry**
 * **Title**: give the tool a title.
 * **Description**: give the tool a description.
 * **Target Link URI**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page.
 * **OpenID Connect Initiation URI**: enter "Login URL" from the Microsoft Learn LTI application’s registration page.
 * **JWK Method**: select **Public JWK URL**
 * We recommend to select the **Public JWK URL** as **JWK Method**. 
 * **Public JWK URL**: enter "Public JWK Set URL" from the Microsoft Learn LTI application’s registration page.
 * If you select **Public JWK**, instead of **Public JWK URL**, as ***JWK Method**, you can enter the "Public JWK" from the Microsoft Learn LTI application's registration page instead of the "Public JWK Set URL". 
![Config.Canvas.2](/images/Config.Canvas.2.png) 
6. Under **LTI Advantage Services**, enable the following options:
 * Can create and view assignment data in the gradebook associated with the tool.
 * Can view assignment data in the gradebook associated with the tool.
 * Can view submission data for assignments associated with the tool.
 * Can create and update submission results for assignments associated with the tool.
 * Can retrieve user data associated with the context the tool is installed in.
 * Can lookup Account information
 * Can list categorized event types.
![Config.Canvas.3](/images/Config.Canvas.3.png) 
7. Under **Additional Settings**, select the **Privacy Level** as **PUBLIC**.
![Config.Canvas.4](/images/Config.Canvas.4.png) 
8. Under **Placements**, make sure **Link Selection** and **Assignment Selection** are selected.
![Config.Canvas.5](/images/Config.Canvas.5.png) 
9. Click **Save**. The key should now appear and listed with the name you provided. 
10. Ensure that the newly added key is set to **Enabled**.
11. Take note of the following parameters:
 * **Client ID**: the number in the **Details** column, above the **Show Key** button
![Config.Canvas.6](/images/Config.Canvas.6.png) 

At the account level, external tools must be installed in the External Apps page in Account Settings. LTI Advantage apps can be added via the Client ID option. Only the Client ID is required to be added.

1. Click **Settings** from the left navigation pane.
2. Click **View App Configurations**.
3. Click **+App**.
4. Enter the following information:
 * **Configuration Type**: select **By Client ID**
 * **Client ID**: enter the "Client ID" from the LTI key registration.
![Config.Canvas.7](/images/Config.Canvas.7.png) 
5. Click **Submit**.
6. If the Client ID is associated with an external tool, the tool name displays in the page. The page also confirms the tool should be installed.
![Config.Canvas.8](/images/Config.Canvas.8.png) 
7. Click **Install**.
8. Continue to configure the Microsoft Learn LTI application, by registering the parameters back in the Learn LTI application's registration page.

The following steps show how to register the parameters back in the Learn LTI application's registration page. If you are not the one who deployed the application, you need to provide these parameters to that person.

1. Open the tool registration page from your browser.
2. Enter the following information:
  * **Display name**: give the tool a name of your choice. 
  * **Issuer**: enter **https://canvas.instructure.com**
  * **JWK Set URL**: enter https://[tenant-name].instructure.com/api/lti/security/jwks
  * **Access Token URL**: enter https://[tenant-name].instructure.com/login/oauth2/token 
  * **Authorization URL**: enter https://[tenant-name].instructure.com/api/lti/authorize_redirect 
   NOTE: [tenant-name] is where your Canvas tenant name hosted by instructure. For example if the url of the LMS is https://canvas.instructure.com, then the [tenant-name] is "canvas". If you are using self-hosted Canvas, replace https://[tenant-name].instructure.com with your canvas URL.
  * **Client ID**: enter "Client ID" from the LTI key registration.
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**.

You're all set. The Learn LTI tool is now configured on your Canvas LMS and your Educators will be able to use it to bring Microsoft Learn content to their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Learn LTI tool.

## Blackboard Learn LMS

The following steps show how to configure an LTI tool on a Blackboard Learn LMS.

### LTI 1.1

At this time, we do not support LTI 1.1 with Blackboard Learn LMS.

### LTI 1.3

Before the LTI Tool can be added to specific Blackboard Learn LMS Tenant, it needs to be registered as an app in Blackboard Dev Portal.

1. Open your browser and go to https://developer.blackboard.com/.
2. Click **Register** to Register and Manage Your Applications.
3. Accept the **Terms & Condition** and click **Agree & Continue**.
4. Create a New Account to register your application. If you already have an account, sign in with one. 
5. Click the **+** icon to register a new application.
6. Enter the following information:
  * **Application Name**: give the tool a name of your choice. For example: "Microsoft Learn".
  * **Description**: give the tool a description. 
  * **Domain**: enter “Domain URL” from the Microsoft Learn LTI application’s registration page.
  * **My Integration supports LTI 1-3**: Enabled.
  * **Login Initiation URL**: enter "Login URL" from the Microsoft Learn LTI application’s registration page.
  * **Tool Redirect URL(s)**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page.
  * **Tool JWKS URL**: enter "Public JWK Set URL" from the Microsoft Learn LTI application’s registration page.
7. Click **Register application and generate API Key**.
8. ⚠️ The secret is only shown once. Make note of the application key and secret and store them in a safe and secure location.
9. Take note of the following parameters:
  * **Application ID**: the string under the **Application ID** column.

Now you are ready to add the app as an LTI Provider in your Blackboard Learn LMS.

1. Open your LMS and sign in with the admin account.
2. Click **Admin** from the left navigation pane to open the Administrator Panel.
3. Click **LTI Tool Providers** under **Integrations**.
4. Click **Register LTI 1.3/Advantage Tool**.
5. Enter the following information:
  * **Client ID**: enter the "Application ID" from the LTI key registration.
6. Click **Submit**.
7. Ensure that **Tool Status** is set to **Approved**.
8. Under Institution Policies:
  * Ensure that all **User Fields to Send** are selected.
  * **Allow grade service access**: Yes
  * **Allow Membership Service Access**: Yes
9. Click **Submit**.
10. Select the newly registered tool and click **Manage Placements**.
11. Click **Create Placements**.
12. Enter the following information:
  * **Label**: give the placement a label. For example: "Microsoft Learn".
  * **Handle**: give the placement a handle.
  * **Availability**: Yes
  * **Type**: Course content tool
  * **Allows grading**: Selected
  * **Launch in New Window**: Selected
  * **Target Link URI**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page.
13. Click **Submit**.
14. Continue to configure the Microsoft Learn LTI application, by registering the parameters back in the Learn LTI application's registration page.

The following steps show how to register the parameters back in the Learn LTI application's registration page. If you are not the one who deployed the application, you need to provide these parameters to that person.

1. Open the tool registration page from your browser.
2. Enter the following information:
  * **Display name**: give the tool a name of your choice. 
  * **Issuer**: enter **https://blackboard.com**
  * **JWK Set URL**: enter https://developer.blackboard.com/api/v1/management/applications/[application-id]/jwks.json, where [application-id] is the "Application ID" from the LTI key registration.
  * **Access Token URL**: enter https://developer.blackboard.com/api/v1/gateway/oauth2/jwttoken
  * **Authorization URL**: enter https://developer.blackboard.com/api/v1/gateway/oidcauth
  * **Client ID**: enter "Application ID" from the LTI key registration.
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**..

You're all set. The Learn LTI tool is now configured on your Blackboard Learn LMS and your Educators will be able to use it to bring Microsoft Learn content to their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Learn LTI tool.
