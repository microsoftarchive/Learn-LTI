# Steps From GitHub

## Microsoft Learn LTI Tool Deployment Instructions
To deploy MS Learn LTI tool follow these steps:
1. Clone the Deployment repository to your machine
2. Make sure that you install:
* [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
* [DotNet Core SDK](https://dotnet.microsoft.com/download/dotnet-core/thank-you/sdk-3.1.301-windows-x64-installer)
* [Node.js](https://nodejs.org/en/download/)
* [npm](https://www.npmjs.com/get-npm)
3. [Sign in with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest)
4. In the cloned repo, inside the deployment directory, execute the file **appRegistration.ps1** and save the result for later.
5. Click the button to deploy the needed resources in Azure.
* [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2FLearn-LTI%2Fmaster%2Fdeployment%2Fazuredeploy.json%3Ftoken%3DAQCAEE2JIAOYTYWW5HDSNSS7AODIM)
6. In the cloned repo, inside the deployment directory, execute the file **Publish.ps1**.
7. You should now see the MS Learn LTI Tool script popup.


# Steps from Script

## Select Subscription

**Type in EduLearnLTI, hit "Enter"**

If you're unsure that your account has a subscription, check [here](https://ms.portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade?WT.mc_id=edna.github.jabenn)

## Choose Location

Here are the regions we support:
* eastasia
* southeastasia
* centralus
* eastus2
* westus
* southcentralus
* northeurope
* westeurope
* japaneast
* brazilsouth
* australiaeast
* canadacentralus
* uksouth
* westcentralus
* westus2
* koreacentral

**Locate your region from the list above. Then type it into the script and hit "Enter".**

Your region determines mainly three things:
* Compliance and Data Residency
* Service Availability
* Pricing

For information regarding your region, check [here](https://azure.microsoft.com/global-infrastructure/geographies/)

## Registering Azure Active Directory App

Done automatically.

## Creating your Resource Group

Done automatically.

## Creating Managed Identity

Done automatically.

## Creating Role Assignment

Done automatically.

## Deploying Resources to Azure

Done automatically.

## Updating Azure Active Directory App

Done automatically.

**Congratualations! Your instance of the tool should now be deployed on Azure!** 

Now we have to configure the tool on your institution's LMS.

# Configuring the tool on your LMS



