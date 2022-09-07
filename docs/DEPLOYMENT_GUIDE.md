# Microsoft Learn LTI Tool Deployment Instructions

## Table of Contents
1. Clone the repo: [link](#clone-the-repo)
2. Deploy to Azure Subscription using the script: [link](#deploy-to-azure-subscription-using-the-script)
3. Configure the tool: [link](#configure-the-tool)

## Prerequisites
To begin, you will need:
- [Azure CLI](https://azcliprod.blob.core.windows.net/msi/azure-cli-2.27.0.msi) readme about [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest?WT.mc_id=learnlti-github-cxa)
    * We currently recommend using Microsoft [Azure CLI version 2.27.0](https://azcliprod.blob.core.windows.net/msi/azure-cli-2.27.0.msi)
    * To download the MSI installer for specific version, change the version segment in URL https://azcliprod.blob.core.windows.net/msi/**version**.msi and download it. Available versions can be found at [Azure CLI release notes](https://docs.microsoft.com/en-us/cli/azure/release-notes-azure-cli?WT.mc_id=learnlti-github-cxa). 
- [DotNet Core SDK .NET Core 3.1](https://dotnet.microsoft.com/download/dotnet/3.1?WT.mc_id=learnlti-github-cxa)
- [Node.js](https://nodejs.org/en/download/)
- [Powershell](https://docs.microsoft.com/powershell/scripting/install/installing-powershell?view=powershell-7?WT.mc_id=learnlti-github-cxa)
- [Git](https://git-scm.com/downloads)
- An Azure subscription

**Note:** Please ensure you **reboot your machine** after the installation of the Prerequisities

Follow these steps to deploy the Microsoft Learn LTI tool:

# Clone the repo
1. Go to the [repo](http://github.com/microsoft/learn-lti) Click code button on the [repo](http://github.com/microsoft/learn-lti)
![Clone Repo](https://github.com/microsoft/Learn-LTI/blob/main/images/clone.png)
3. Simply click the code button and select Open with GitHub Desktop or Download Zip to clone contents of the repo.

If you are using Git
1. Open a command prompt
2. Make a new directory **Learn-Lti**
3. Move to **Learn-Lti** directory
4. Use Git to clone the repo (You need [Git installed](https://git-scm.com/downloads)
5. Enter in the command in the Git console
   * `git clone https://github.com/microsoft/Learn-LTI.git`
   * This will clone the repo into the current directory **Learn-Lti**

You have now cloned the repo

## After Cloning
* In the cloned repo, inside the deployment directory **Learn-Lti**, execute the file **run.bat**.
* run.bat bypasses signing requirements and runs Deploy.ps1 automatically.
* You should now see the Microsoft Learn LTI Tool script popup.
![run.start.png](/images/run.start.png)

# Deploy to Azure Subscription using the script

## Login to Azure

The script will ask you to login to Azure by navigating to the Azure Login Page on your browser.

## Choose Subscription

Type in the name of the Azure subscription that you hold (this is a prerequisite necessary for deployment).

If you're unsure about whether your account has a subscription, check [here.](https://ms.portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade??WT.mc_id=learnlti-github-cxa)

## Choose Location

The following regions are supported:

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

![Deployment.1](/images/Deployment.1.jpg)

Your region determines three things:

* Compliance and Data Residency
* Service Availability
* Pricing

For information regarding your region, check [here.](https://azure.microsoft.com/global-infrastructure/geographies/?WT.mc_id=learnlti-github-cxa)

## Azure Autoconfigure

The **Deploy.ps1** script will automatically provision and configure the required resources for you.

## ⚠️ Tool Registration URL 

The Script will display the Tool Registration URL after completion. Please **copy the URL and keep it handy** since it will be required while configuring the tool in the LMS.

![Deployment.4](/images/Deployment.4.PNG)

Open the tool registration page from your browser and take note of the following parameters. 

* Login URL
* Launch URL
* Domain URL
* Public Key
* Public JWK
* Public JWK Set URL

![Deployment.5](/images/Deployment.5.png)

**Congratulations!** Your instance of the tool should now be deployed on Azure! 

If your **deployment failed**, click [here](./TROUBLESHOOTING.md) for help.

Once the tool has been successfully deployed, the next step is to [configure the tool](./CONFIGURATION_GUIDE.md) on your institution's LMS.
