# B2C Cleanup User Docs

## Terminal screenshots key:
* Red background = hidden B2C value
* Orange background = hidden AD value
* Pink background = user inputted value

## Prerequisites

* You should have already created on Azure:
  * 1x AD tenant
  * 1x B2C tenant

## Starting The Script

* Load Learn-LTI/Deployment into Windows File Explorer
* **Hold shift** and right click in the file explorer to launch the Expanded Context Menu

| ![Expanded Context Menu](Images/01_ExpandedContextMenu.png) |
|---|
|  Click "Open Powershell Window Here" to launch powershell with cd already set to Learn-Lti/Deployment  |

* Type ".\B2CCleanup.ps1" into the newly launched Powershell then press enter 
  * ![start script](Images/Deployment/00a_startScript.png)

## Step 0: Enter tenant names

* You will immediately be prompted to input the name of the B2C and AD tenants you have created: <br> 1. First, input the name of the B2C Tenant you have created<br> 2. Next, input the name of the Azure AD Tenant you have created
  * ![input tenant names](Images/Deployment/00b_tenantNames.png)


## Step 1: Create AD application

### Login to AD Tenant via your browser

* Your powershell will now prompt you that a pop-up window has launched in your browser and directing you to log in to your AD tenant through it
    * ![Login to AD Prompt](Images/Deployment/01b_LoginPrompt.png)

| ![Login to AD Tenant](Images/Deployment/01a_LoginTenant1.png) |
|---|
| The launched tab should look similar to the above; please login using it and then switch back to the powershell |

### Creating the app and its secret

* Return to your powershell Window, and you will now be prompted to give names for:<br>1. The AD Application to be created<br>2. The AD Applications Secret to be created<br>We suggest using a sensible name, such as "b2c_AD_app" and "b2c_AD_app_secret"
    * ![Input app and secret name](Images/Deployment/01c_appName.png)

### Recording the secret value (important)
* Upon successfully creating the app and its secret; the script will now output some important values in green and then pause until you next press Enter. <br>It is strongly recommended now that you take a moment to **store somewhere safe the ID of the app and the value for the secret** that has just been created for it; as this **secret value will no longer be accessible again**.<br>After recording these values press enter to continue with the script.
    * ![record the secret](Images/Deployment/01d_secret.png)


## Step 2: Logging into the B2C tenant via your browser

* Your powershell will now prompt you that a pop-up window has launched in your browser and directing you to login to your B2C tenant through it
    * ![login prompt](Images/Deployment/02a_LoginPrompt.png)

| ![Login to AD Tenant](Images/Deployment/01a_LoginTenant1.png) |
|---|
| The launched tab should look similar to the above; please login using it and then switch back to the powershell |

## Step 3: Creating the B2C Web Application

### Creating the webapp and its secret

* Return to your powershell Window, and you will now be prompted to give names for:<br>1. The B2C Web Application to be created<br>2. The B2C Web Applications Secret to be created<br>We suggest using a sensible name, such as "b2c_AD_webapp" and "b2c_AD_webapp_secret"
    * ![name web app](Images/Deployment/03a_nameWebApp.png)


### Recording the secret value (important)

* Upon successfully creating the webapp and its secret; the script will now output some important values in green and then pause until you next press Enter. <br>It is strongly recommended now that you take a moment to **store somewhere safe the ID of the app and the value for the secret** that has just been created for it; as this **secret value will no longer be accessible again**.<br>After recording these values press enter to continue with the script.
    * ![record webapp secret](Images/Deployment/03b_secret.png)


## Steps 4 & 5: Creating the Identity Experience Framework & Proxy Identity Experience Framework Applications

* No user input is required in these steps; simply wait for them to finish


## Step 6: Creating Permission Management Application

### Creating the Permission Management Application and its secret

* Return to your powershell Window, and you will now be prompted to give names for:<br>1. The B2C Permission Management Application to be created<br>2. The 2C Permission Management Applications Secret to be created<br>We suggest using a sensible name, such as "b2c_AD_PMA" and "b2c_AD_PMA_secret"
    * ![name the PMA](Images/Deployment/06a_namePMA.png)


### Recording the secret value (important)

* Upon successfully creating the permission management app and its secret; the script will now output some important values in green and then pause until you next press Enter. <br>It is strongly recommended now that you take a moment to **store somewhere safe the ID of the app and the value for the secret** that has just been created for it; as this **secret value will no longer be accessible again**.<br>After recording these values press enter to continue with the script.
    * ![secret PMA value](Images/Deployment/06b_secret.png)


## Step 7: (Optional) linking facebook app

### Don't link Facebook App

* If you do not have a facebook application to link, simply input 'n' when prompted to skip this step
    * ![Don't link FB](Images/Deployment/07_noFB.png)


### Link Facebook App

* If you do have a facebook application to link, input 'y' when prompted then input the ID of the Facebook application you would like to lin
    * ![Do link FB](Images/Deployment/07_yesFB.png)





## Step 8 & 9: Creating and Generating Custom Policies from templates

* No user input is required in these steps; simply wait for them to finish

## Step 10: Adding Signing and Encryption keys and AADAppSecret for the IEF Applications

### Input key duration
* You will first be prompted to input how long you wish the created keys to be valid for before they expire
    * ![key duration](Images/Deployment/10a_time.png)

#### <span style="color:red">Troubleshoot PMA Admin Consent</span>

* This step may fail due to a race condition between the granting of admin-consent vs the requirement of its usage in this step; you will know this has occured if you see the error message shown below
    * ![error admin-consent race](Images/Deployment/10b_error.png)
* To solve this issue, follow the link highlighted yellow in your console which will take you to the below page. On this page you should see a button called "Grant admin consent for {B2C Tenant Name} circled in red.
    * ![Application permissions page](Images/Deployment/10tb_ManuallyGrantAdminConsent.png)
* After clicking on "Grant Admin Consent" the page should now say all permissions are granted
    * ![Application permissions page](Images/Deployment/10tc_FullyGranted.png)
* Now simply return to the script and press enter
    * The script should then continue without requiring any further user inputs


## Step 11: Creating the AADAppSecret Key

* No user input is required in this step; simply wait for it to finish
* Upon this steps completion the B2C setup is now complete and can be configured with Learn-LTI


# Important note: Keep the generated AppInfo.csv safe
* This contains the ID's of the created applications as well as the tenants they belong to; this is required by B2CCleanup.ps1 if you wish to automatically clean up the script at a later date you will need this file (or else you must manually delete those applications)





# <span style="color:red">Trouble shooting</span>
* [STEP 10: Error when getting the list of all custom policies in the tenant ](#troubleshoot-pma-admin-consent)