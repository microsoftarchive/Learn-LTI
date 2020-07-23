# Microsoft Learn LTI Tool Deployment Instructions
## Prerequisites
To begin, you will need:
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest?WT.mc_id=learnlti-github-cxa)
- [DotNet Core SDK](https://dotnet.microsoft.com/download?WT.mc_id=learnlti-github-cxa)
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [Powershell](https://docs.microsoft.com/powershell/scripting/install/installing-powershell?view=powershell-7?WT.mc_id=learnlti-github-cxa)

Follow these steps to deploy the MS Learn LTI tool:

# Part 1: Steps from repository 
1. Clone the Deployment repository to your machine
2. Make sure that you have the following installed:
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest?WT.mc_id=learnlti-github-cxa)
* [DotNet Core SDK](https://dotnet.microsoft.com/download?WT.mc_id=learnlti-github-cxa)
* [Node.js](https://nodejs.org/en/download/)
* [npm](https://www.npmjs.com/get-npm)
* [Powershell](https://docs.microsoft.com/powershell/scripting/install/installing-powershell?view=powershell-7?WT.mc_id=learnlti-github-cxa)
3. [Sign in with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest?WT.mc_id=learnlti-github-cxa)
4. In the cloned repo, inside the deployment directory, execute the file **appRegistration.ps1** and save the result for later.
5. Click the button to deploy the needed resources in Azure.
* [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2FLearn-LTI%2Fmaster%2Fdeployment%2Fazuredeploy.json%3Ftoken%3DAQCAEE2JIAOYTYWW5HDSNSS7AODIM)
6. In the cloned repo, inside the deployment directory, execute the file **Publish.ps1**.
7. You should now see the MS Learn LTI Tool script popup.


# Part 2: Steps from Script

## Select Subscription

**Type in EduLearnLTI, hit "Enter"**

If you're unsure about whether your account has a subscription, check [here](https://ms.portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade??WT.mc_id=learnlti-github-cxa)

## Choose Location

Here are the regions we support:
* eastasia
* southeastasia
* centralus
* eastus
* eastus2
* westus
* southcentralus
* northeurope
* westeurope
* japaneast
* brazilsouth
* australiaeast
* canadacentral
* uksouth
* westcentralus
* westus2
* koreacentral

**Locate your region from the list above. Then type it into the script and hit "Enter".**

![Deployment.1](./images/Deployment.1.jpg)

Your region determines three things:
* Compliance and Data Residency
* Service Availability
* Pricing

For information regarding your region, check [here](https://azure.microsoft.com/global-infrastructure/geographies/?WT.mc_id=learnlti-github-cxa)

## Registering Azure Active Directory App

The **Publish.ps1** script will automatically configure this step. 

## Creating your Resource Group

The **Publish.ps1** script will automatically configure this step.

## Creating Managed Identity

The **Publish.ps1** script will automatically configure this step.

## Creating Role Assignment

The **Publish.ps1** script will automatically configure this step.

## Deploying Resources to Azure

The **Publish.ps1** script will automatically configure this step.

## Updating Azure Active Directory App

The **Publish.ps1** script will automatically configure this step.

**Congratulations!** Your instance of the tool should now be deployed on Azure! 

![Deployment.2](./images/Deployment.2.jpg)

If your **deployment failed** click [here](./TROUBLESHOOTING.md) for help.

Once the tool has been successfully deployed, the next step is to configure the tool on your institution's LMS.

# Part 3: Configuring the tool in your LMS

## From your LMS administration settings, configure a tool manually. 

The following details the configuration process for Moodle. 

![Config.1](./images/Config.1.png)
![Config.2](./images/Config.2.png)
![Config.3](./images/Config.3.png)
![Config.4](./images/Config.4.png)

## From the tool settings page, identify the following fields and make the corresponding changes.

1. Change public key type to a RSA key
![Config.5](./images/Config.5.png)

2. Change the LTI version to 1.3
![Config.6](./images/Config.6.png)

3. Change the Default launch container to New Window
![Config.9](./images/Config.9.png)

4. From Microsoft's Learn LTI tool's registration page, locate the Tool Settings section. 
![Config.8](./images/Config.8.png)
   * Use the Launch URL from Microsoft's Learn LTI tool's registration page to update your LMS tool's Tool URL and Redirection URL
   * Use the Login URL from Microsoft's Learn LTI tool's registration page to update your LMS tool's Tool Initiate login URL
   * Use the Public Key rom Microsoft's Learn LTI tool's registration page to update your LMS tool's Tool Public Key

## From your LMS tool services settings

Change your LMS LTI Names and Role Provisioning setting to "Use this service to retrieve members' information as per privacy settings"
![Config.11](./images/Config.11.png)

## From your LMS tool privacy settings
![Config.12](./images/Config.12.png)
Update all permissions to Always

## Access your tool configuration details and make the following changes to the Microsoft Learn LTI Tool Registration page under Platform settings
![Config.14](./images/Config.14.png)
1. Make Issuer your Platform ID
2. Make Client ID your Client ID **under Tool Settings**
3. Make JWK Set URL your Public keyset URL
4. Make Access token URL your Access token URL 
5. Make Authoritization URL your Authentication request URL
6. On the bottom right of the Microsoft LTI Tool Registration page, Hit Save Registration.

That's it!! Whew. You are good to go :)
