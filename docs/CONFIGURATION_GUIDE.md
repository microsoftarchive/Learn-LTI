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

- [Open edX](#Open-edX-LMS)
- [Moodle](#Moodle-LMS)
- [Canvas](#Canvas-LMS)
- [Blackboard](#Blackboard-Learn-LMS)
- [Brightspace D2L](#Brightspace-D2L)


## Open edX LMS

The following steps show how to configure an LTI tool on a Open edX LMS. If you haven't deployed Open edX, using [Azure quickstart template](https://github.com/Azure/azure-quickstart-templates/tree/master/application-workloads/opendx/openedx-tutor-lilac-ubuntu) (deploy Open edX (Lilac release) through tutor on Ubuntu) is recommended.

### lTI 1.3

1. Sign into Open edX Studio (I.e., the Content Management System of Open edX) with the admin account.
2. Enable the LTI Consumer XBlock in Open edX Studio through the advanced settings based on the following steps:
   1. From the main page of a specific course, navigate to **Settings -> Advanced Settings** from the top menu.
   2.	Check for the **advanced_modules** policy key and add **"lti_consumer"** to the policy value list, per the below figure.
   ![Config_edx.2](/images/Config_edx.2.png)
   3.	Click the **"Save changes"** button.
3. Edit the unit in which you want to add the remote LTI tool and select **Advanced** from within the **Add New Component** section. Select **LTI Consumer**.
4. In the CMS Admin panel, enable course edit lti fields. To enable Course edit lti fields, select "Course edit lti fields enabled flags" under XBLOCK CONFIGURATION section and then enable it. **Course id can be found in course overviews.**
![Config_edx.5](/images/Config_edx.5.png)
5. In the LMS Admin panel, enable the transfer of PII (incl. email) between an edX LTI Xblock component and the MS Learn Functions App.
   1. Add a course waffle flag from http://EDX-LMS-URL/admin/waffle_utils/waffleflagcourseoverridemodel/.
   2. Set waffle flag to - lti_consumer.lti_nrps_transmit_pii and set course key to your course key. : YOUR-COURSE-ID.
   3. Make sure to set the override choice option to - Force On
   ![Config_edx.1](/images/Config_edx.1.png)
   4. (optional) For security reasons, edX only allows to transmit enrolment PII for courses with less than 1000 students per default. To change this set the LTI_NRPS_ACTIVE_ENROLLMENT_LIMIT Django setting to a lower/higher value.
   --> adapted from - https://github.com/edx/xblock-lti-consumer/pull/124
6. Select **Edit** inside the newly created component.
![Config_edx.7](/images/Config_edx.7.png)
7. In the **LTI Version** field, select **LTI 1.3**.
8. Enter the LTI 1.3 settings provided in the Learn Lti Registration form. For basic LTI 1.3 tools, you need to set the following settings:
   * **LTI 1.3 Tool Launch URL** (can also be called redirect url)
   * **LTI 1.3 OIDC URL** (can also be called login url)
   * **LTI 1.3 Tool Public Key** (a key provided by the LTI tool) The key will look similar to this example:
   -----BEGIN PUBLIC KEY-----abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345 abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345abcde12345-----END PUBLIC KEY-----
   You should paste the key from the tool directly into the configuration field. For more information about each setting, see the LTI Component Settings.
9. Enable LTI NRPS through setting it to True. 
![Config_edx.3](/images/Config_edx.3.png)
10. Enable Request user's username and email settings to True.
![Config_edx.6](/images/Config_edx.6.png)
11. Select **Save**.
12. The Studio page will refresh and display LTI configuration required by the tool. Copy each of those values and follow the instructions provided by the tool to set them up.
   * **Client** -> Client ID
   * **Audience**: This can be left blank 
   * **Keyset URL** -> JWK Set URL
   * **OAuth Token URL** ->Access Token URL
   * **OIDC Callback URL** -> Authorizaton URL
   ![Config_edx.4](/images/Config_edx.4.png)
13. Publish the unit where the LTI Component is located.


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
 * **Audience**: This can be left blank 
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
  * **Issuer**: enter **https://canvas.instructure.com** (this should always be canvas.infrastructure.com not matter your tenant url)
  * **JWK Set URL**: enter https://[tenant-name].instructure.com/api/lti/security/jwks
  * **Access Token URL**: enter https://[tenant-name].instructure.com/login/oauth2/token 
  * **Authorization URL**: enter https://[tenant-name].instructure.com/api/lti/authorize_redirect 
   NOTE: [tenant-name] is where your Canvas tenant name hosted by instructure. For example if the url of the LMS is https://canvas1.instructure.com, then the [tenant-name] is "canvas1". If you are using self-hosted Canvas, replace https://[tenant-name].instructure.com with your canvas URL.
  * **Client ID**: enter "Client ID" from the LTI key registration.
  * **Audience**: This can be left blank 
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
![Config.Blackboard.1](/images/Config.Blackboard.1.png) 
  * **Login Initiation URL**: enter "Login URL" from the Microsoft Learn LTI application’s registration page.
  * **Tool Redirect URL(s)**: enter the "Launch URL" from Microsoft Learn LTI application’s registration page.
  * **Tool JWKS URL**: enter "Public JWK Set URL" from the Microsoft Learn LTI application’s registration page.
![Config.Blackboard.2](/images/Config.Blackboard.2.png) 
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
![Config.Blackboard.3](/images/Config.Blackboard.3.png) 
7. Ensure that **Tool Status** is set to **Approved**.
8. Under Institution Policies:
  * Ensure that all **User Fields to Send** are selected.
  * **Allow grade service access**: Yes
  * **Allow Membership Service Access**: Yes
9. Click **Submit**.
![Config.Blackboard.4](/images/Config.Blackboard.4.png) 
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
  * **Audience**: This can be left blank 
3. Optionally, you can add your Institution name and logo on the registration page.
4. Click **SAVE REGISTRATION**..

You're all set. The Learn LTI tool is now configured on your Blackboard Learn LMS and your Educators will be able to use it to bring Microsoft Learn content to their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Learn LTI tool.

## Brightspace D2L

The following steps show how to configure the MS Learn LTI Tool on a Brightspace LMS.

### LTI 1.1

At this time, we do not support LTI 1.1 with Brightspace LMS.

### LTI 1.3

Before the Links to MSLearn LTI Links can be added to courses, It must be registered and deployed into the tenant. LTI 1.3 in Brightspace is known as LTI Advantage.

1. Open your browser and go to your Brightspace environment as a superadmin.
2. Click the gear at the top right corner and select **External Learning Tools**.
3. Select the **LTI Advantage** Tab.
4. Click the **New Deployment** button. 
5. Click the *?* icon next to the Select Registered Tool Button. and in the resulting window Click the **Register** link.
![Config.Brightspace.1](/images/Config.Brightspace.1.png) 
6. Click **Register Tool** on the resulting page.
7. In the next screen. Select **Standard**. 
8. Enter the following information:
  * **Name**: give the tool a name of your choice. For example: "Microsoft Learn".
  * **Description**: give the tool a description. Optional.
  * **Domain**: enter “Domain URL” from the Microsoft Learn LTI application’s registration page. Note: Put HTTPS:// in front of the domain.
  * **Redirect URLs**: enter “Launch URL” from the Microsoft Learn LTI application’s registration page.
  * **OpenID Connect Login URL**: enter “Login URL” from the Microsoft Learn LTI application’s registration page.
  * **Redirect URLs**: enter “Launch URL” from the Microsoft Learn LTI application’s registration page.
  * **Target Link URI**: enter “Launch URL” from the Microsoft Learn LTI application’s registration page.
  * **Keyset URL**: enter “Public JWK Set URL” from the Microsoft Learn LTI application’s registration page.
  * **Extensions**: Ensure at least Name and Role Provisioning Services is checked. 
  * **Roles-> Send Institution Role**: Unchecked.
![Config.Brightspace.2](/images/Config.Brightspace.2.png) 
9. Once Registered, It will give you a set of Brightspace Registration Details. This Includes: 
		Client Id, Brightspace Keyset URL, Brightspace OAuth2 Access Token URL, OpenID Connect Authentication Endpoint, Brightspace OAuth2 Audience, and Issuer.
		You will need this information to register the platform back to the Learn LTI Application's registration page.
10. Follow Steps 2-4 to return to the **New Deployment** page.
11. Select the Newly Registered Tool 
  * **Name**: give the tool Deployment a name of your choice. For example: "Microsoft Learn".
  * **Tool**: Select the newly Registered Tool from the above step.
  * **Extensions**: Check off the same boxes that you selected during tool registration, Minimum: Names and Role Provisioning Services.
  * **Security Settings**: All Boxes Selected except Anonymous. It may be find to have less selected, however it was tested with the described settings.
  * **Make Tool Available to:**: to control access to the tool if desired to limit scope of tool to either a particular course, org wide etc. Varies depending on desired outcome.
12. Click **Create Deployment**
13. Once created, return to the deployment details of the newly created page, and at the very bottom select View Links.
![Config.Brightspace.3](/images/Config.Brightspace.3.png) 
14. You can now create a **New Link**
  * **URL**: Enter the Launch URL in here. 
  * Other fields as desired.

  Return to the Learn LTI Tool Registration Page
15. Go to Learn LTI Application Registration Page. You will need the Output from the Tool Registration Step above. 
  * **Display Name**: give the tool a name of your choice. For example: "Brightspace".
  * **Issuer**: enter “Issuer” from the Previous Step's output.
  * **JWK Set URL**: enter “Brightspace Keyset URL” from the Previous Step's output.
  * **Access Token URL**: enter “Brightspace OAuth2 Access Token URL” from the Previous Step's output.
  * **Authorization URL**: enter “OpenID Connect Authentication Endpoint” from the Previous Step's output.
	Further Down.. 
  * **Client ID**: enter “Client Id” from the Previous Step's output.
  * **Audience**: enter “Brightspace OAuth2 Audience” from the Previous Step's output.
	Fill in any of the optional fields at the bottom as desired.
16. Click **Save Registration**.

You are now Ready to test/use the tool as An external tool source. 
Add an External Learning Tool as content to a course. and Click the link. if your role is a Teacher then it will launch the teacher interface, and if your role is a student it will show you
no content has yet been published.

You're all set. The Learn LTI tool is now configured on your Brightspace LMS and your Educators will be able to use it to bring Microsoft Learn content to their courses. Follow the [educator guide](./USER_GUIDE.md) to create assignments that use the Learn LTI tool.

*Note: If You always see the student view in the tool and only see no content published, It is most likely because your user(s) have multiple roles assigned to them for that context. if a user is both 
student and teacher role in a given course(context), then it will default to student.
