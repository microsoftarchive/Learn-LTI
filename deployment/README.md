## Microsoft Learn LTI Tool Deployment Instructions
To deploy MS Learn LTI tool follow these steps:
1. Clone this repository to your machine
2. Make sure that you install:
2.1. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
2.2. [DotNet Core SDK](https://dotnet.microsoft.com/download/dotnet-core/thank-you/sdk-3.1.301-windows-x64-installer)
2.3. [Node.js](https://nodejs.org/en/download/)
3. [Sign in with Azure CLI](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest)
4. In the cloned repo, inside the deployment directory, execute the file **appRegistration.ps1** and save the result for later.
5. Click the button to deploy the needed resources in Azure.
[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2FLearn-LTI%2Fmaster%2Fdeployment%2Fazuredeploy.json%3Ftoken%3DAQCAEE2JIAOYTYWW5HDSNSS7AODIM)
6. In the cloned repo, inside the deployment directory, execute the file **Publish.ps1**.

... Installation guide from the LMS side and so on.
