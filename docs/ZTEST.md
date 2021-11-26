# Testing LTI https://ztest.cengage.info/ztest/

## Using Ztest tooling 

### This test will check data is passed to the LTI tool, and thus will require to use the network developer tool in the browser.

### Pre-requisite: install an LTI 1.1 or 1.3 tool

You need an LTI 1.3 tool installed on your LMS. 

If you don't have one, you can install for example ZTest by following the steps for Moodle you should be able to replicate these instructions for other LMS:

### Testing LTI 1.3 
- Log in as an administrator
- Navigate to Site Administration > Plugins > External tool > Manage tools
- Click on configure a tool manually

Fill the form as follow:
- Tool name: ZTest
- Tool url: https://ztest.cengage.info/ztest/lti
- LTI Version: LTI 1.3
- Public key: copy the value from https://ztest.cengage.info/ztest/ LTI 1.3 Connect info tab
- Initiate Login URI: https://ztest.cengage.info/ztest/ws/lti/startlaunch?lti13=true&client_id=CLIENT_ID_HERE&platform=moodle
- Redirect URI: https://ztest.cengage.info/ztest/lti13
-Click on ‘Show more’

Check Content-Item message

Once the tool is created, press the "Tool configuration" icon.
Take note of the following values:

- Client ID
- Deployment ID
- Close the modal and edit the tool.
- Update the initiate login URI and replace CLIENT_ID_HERE with the client id value for that tool
- Save the changes
- Verify client_id and deployment_id are passed on Deep Linking launch and Resource Link Launch

### Log into your LMS
As an instructor, log to a course
- Turn editing ON
- Click Add an activity or resource and select external tool
- On the Add external tool page, select ZTest 13 tool for the preconfigured tool
- Open your browser's developer tool and open the Network tab.
- Click on Select Content

In the modal:
- Click content-item button
- Click on Select Content
- On the browser dev tool's network tab. Search for the entry for "startlaunch".

Verify the following:
- The request URL: https://ztest.cengage.info/ztest/ws/lti/startlaunch?lti13=true&- client_id=CLIENT_ID_HERE&platform=moodle
- "client_id parameter" equal to the tool's Client ID
- "lti_deployment_id" parameter equal to the tool's Deployment ID

In the modal:
- Click on menu icon on the top-right part and select "Content Item"
- Click Submit button
- Once back in the External Link Editor choose Save and Display
- Once ZTest is displayed, verify in the network tab:
https://ztest.cengage.info/ztest/ws/lti/startlaunch
- "client_id parameter" equal to the tool's Client ID
- "lti_deployment_id" parameter equal to the tool's Deployment ID