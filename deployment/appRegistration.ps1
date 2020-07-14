$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition;
$executionStartTime = $(get-date -f dd-MM-yyyy-HH-mm-ss);
$LogFile = -join($scriptPath,"\Log\Log-",$executionStartTime,".log");

function WriteLog
{
   param([string]$Level, [string]$Message) 

   $logMsg = ("[" + (Get-Date).ToString() + "][" + $Level + "]" + " - " + $Message);
   $logMsg >> $LogFile;
}

function Write-Title {
    param(
        [Parameter(Mandatory)]
        [string]$Title
    )
    Write-Host '';
    Write-Host '';
    Write-Host '=====================';
    Write-Host $Title;
    Write-Host '=====================';
    Write-Host '';
    Write-Host '';
    
}

function ThrowException {
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    WriteLog("ERROR", $Message);
    Write-Host 'Encountered an Error while executing the Script. Please reach out to support at support@microsoft.com. Ensure to attach the Logs Folder (Created next to the ps file) with the mail';
    throw $Message;    
}




Write-Host ' __  __  _____     _      ______          _____  _   _';
Write-Host '|  \/  |/ ____|   | |    |  ____|   /\   |  __ \| \ | |';
Write-Host '| \  / | (___     | |    | |__     /  \  | |__) |  \| |';
Write-Host '| |\/| |\___ \    | |    |  __|   / /\ \ |  _  /| . ` |';
Write-Host '| |  | |____) |   | |____| |____ / ____ \| | \ \| |\  |';
Write-Host '|_|  |_|_____/____|______|______/_/   _\_\_|_ \_\_| \_|';
Write-Host '';
Write-Host ' _   _______ _____     _______ ____   ____  _';
Write-Host '| | |__   __|_   _|   |__   __/ __ \ / __ \| |';
Write-Host '| |    | |    | |        | | | |  | | |  | | |';
Write-Host '| |    | |    | |        | | | |  | | |  | | |';
Write-Host '| |____| |   _| |_       | | | |__| | |__| | |____';
Write-Host '|______|_|  |_____|      |_|  \____/ \____/|______|';
Write-Host '';

Write-Title('STEP #1 - Logging into Azure');
WriteLog("INFO", "Logging in to Azure");
$loginOp = az login | ConvertFrom-Json
if(!$loginOp)
{
    $message = "Encountered an Error while trying to Login.";
    ThrowException($message);
} 
WriteLog("INFO", "Successfully logged in to Azure.");
Write-Host 'Successfully logged in to Azure'

Write-Title('STEP #2 - Choose Subscription');

WriteLog("INFO", "Fetching List of Subscriptions in Users Account");

$subscriptionList = ((az account list --all --output json));
if(!$subscriptionList)
{
    $message = "Encountered an Error while trying to fetch Subscription List.";
    ThrowException($message);
}

$subscriptionCount = 0;
foreach ($subscription in $subscriptionList) {
    $subscriptionCount += 1;
}

WriteLog("INFO", "Count of Subscriptions: " + $subscriptionCount);


if ($subscriptionCount -eq 0) {
    ThrowException("Please create atlease ONE Subscription in your Azure Account");
}
if ($subscriptionCount -eq 1) {
    $subscriptionName = $subscriptionList[0].name;
    WriteLog("INFO", "Defaulting to Subscription with Name: " + $subscriptionName);
}
else {   
    az account list --output table --all --query "[].{Name:name, Id:id IsDefault:isDefault}"

    Write-Host '';
    Write-Host '';
    $subscriptionName = Read-Host 'Enter Subscription Name from Above List'
    WriteLog("INFO", "User Entered Subscription Name: " + $subscriptionName);

}
#TODO: Check if Subscription Name is one from the List only

$setSubscriptionNameOp = (az account set --subscription $subscriptionName)
#Intentionally not catching an exception here since the set subscription commands behavior (output) is different from others



Write-Title('STEP #3 - Choose Location');

WriteLog("INFO", "Fetching List of Locations");
az account list-locations --output table --query "[].{Name:name}"

Write-Host '';
Write-Host '';
$locationName = Read-Host 'Enter Location From Above List for Resource Provisioning'

Write-Title('STEP #4 - Registering Azure Active Directory App');

$resourceGroupName = "MSLearnLTI";
$identityName = "MSLearnLTI-Identity"
$roleName = "Contributor"
$templateFileName = "azuredeploy.json"
$appName = "MS-Learn-Lti-Tool-App"
$deploymentName = "Deployment-" + $executionStartTime;

WriteLog("INFO", "Creating AAD App with Name: " + $appName);
$appinfo=$(az ad app create --display-name $appName) | ConvertFrom-Json;
if(!$appinfo)
{
    $message = "Encountered an Error while creating AAD App";
    ThrowException($message);
}

WriteLog("INFO", "Updating Identifier URI's in AAD App to: "+  "api://$($appinfo.appId)");
$appUpdateOp = az ad app update --id $appinfo.appId --identifier-uris "api://$($appinfo.appId)";
#Intentionally not catching an exception here since the app update commands behavior (output) is different from others

Write-Host 'App Created Successfully';

Write-Title('STEP #5 - Creating Resource Group');

WriteLog("INFO", "Creating Resource Group with Name : " + $resourceGroupName + " at Location: " + $locationName);
$resourceGroupCreationOp = az group create -l $locationName -n $resourceGroupName
if(!$resourceGroupCreationOp)
{
    $message = "Encountered an Error while creating Resource Group with Name : " + $resourceGroupName + " at Location: " + $locationName + ". One Reason could be that the Resource Group with the same name but different location already exists in your Subscription. Delete the othe Resource Group and run this script again.";
    ThrowException($message);
}

Write-Host 'Resource Group Created Successfully';

Write-Title('STEP #6 - Creating Managed Identity');

WriteLog("INFO", "Creating Managed identity inside ResourceGroup: " + $resourceGroupName + " and Identity Name: " + $identityName);
$identityObj = (az identity create -g $resourceGroupName -n $identityName) | ConvertFrom-Json
if(!$identityObj)
{
    $message = "Encountered an Error while creating managed identity inside ResourceGroup: " + $resourceGroupName + " and Identity Name: " + $identityName;
    ThrowException($message);
}
Write-Host 'Managed Identity Created Successfully';

#It takes a few seconds for the Managed Identity to spin up and be available for further processing
WriteLog("INFO", "Sleeping for 30 seconds");
Start-Sleep -s 30

Write-Title('STEP #7 - Creating Role Assignment');

WriteLog("INFO", "Assigning Role: " + $roleName + " to PrincipalID: " + $identityObj.principalId);
$roleAssignmentOp = az role assignment create --assignee-object-id $identityObj.principalId --assignee-principal-type ServicePrincipal --role $roleName
if(!$roleAssignmentOp)
{
    $message = "Encountered an Error while creating Role Assignment";
    ThrowException($message);
}

Write-Host 'Role Assignment Created Successfully';

Write-Title('STEP #8 - Deploying Resources to Azure');

WriteLog("INFO", "Deploying ARM Template to Azure inside ResourceGroup: " + $resourceGroupName + " with DeploymentName: " + $deploymentName +  " TemplateFile: " + $templateFileName + " AppClientId: " + $appinfo.appId + " IdentifiedURI: " + $appinfo.identifierUris);
$deploymentOutput = (az deployment group create --resource-group $resourceGroupName --name $deploymentName --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($appinfo.identifierUris)) | ConvertFrom-Json;
if(!$deploymentOutput)
{
    $message = "Encountered an Error while deploying to Azure";
    ThrowException($message);
}

Write-Host 'Deployment to Azure Completed Successfully';

Write-Title('STEP #9 - Updating AAD App');

WriteLog("INFO", "Updating App with ID: " + $appinfo.appId + " to Redirect URL: " +  $deploymentOutput.properties.outputs.webClientURL.value + " and also enabling Implicit Flow");
$appUpdateRedirectUrlOp = az ad app update --id $appinfo.appId --reply-urls $deploymentOutput.properties.outputs.webClientURL.value --oauth2-allow-implicit-flow true
#Intentionally not catching an exception here since the app update commands behavior (output) is different from others

Write-Host 'App Update Completed Successfully';

Write-Title('=========Successfully Deployed Resources to Azure============');