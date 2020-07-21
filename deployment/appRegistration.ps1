$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition;
$executionStartTime = $(get-date -f dd-MM-yyyy-HH-mm-ss);
$LogFile = -join($scriptPath,"\Log\Log-",$executionStartTime,".log");
$TranscriptFile = -join($scriptPath,"\Log\Transcript-",$executionStartTime,".log");
$resourceGroupName = "MSLearnLTI";
$identityName = "MSLearnLTI-Identity"
$roleName = "Contributor"
$templateFileName = "azuredeploy.json"
$appName = "MS-Learn-Lti-Tool-App"
$deploymentName = "Deployment-" + $executionStartTime;
$graphAPIId = '00000003-0000-0000-c000-000000000000';
$graphAPIPermissionId = 'e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope';
Start-Transcript -Path $TranscriptFile;

function WriteLog
{
   param([string]$Message) 

   $logMsg = ("[" + (Get-Date).ToString() + "]" + " - " + $Message);
   $logMsg >> $LogFile;
}

function WriteInfoLog{
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    WriteLog("[INFO] - " + $Message)
}

function WriteErrorLog{
    param([string]$Message)
    WriteLog("[ERROR] - " + $Message)
}

function Write-Title {
    param(
        [Parameter(Mandatory)]
        [string]$Title
    )
    Write-Host '';
    Write-Host '';
    Write-Host '=============================================================';
    Write-Host $Title;
    Write-Host '=============================================================';
    Write-Host '';
    Write-Host '';
    
}

function ThrowException {
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    WriteErrorLog($Message);
    Write-Host($Message);
    Write-Host 'Encountered an Error while executing the Script. Please report the bug on Github (along with Error Message & Logs)';
    Stop-Transcript;
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

WriteInfoLog("Logging in to Azure");
$loginOp = az login | ConvertFrom-Json
if(!$loginOp)
{
    $message = "Encountered an Error while trying to Login.";
    ThrowException($message);
} 
WriteInfoLog("Successfully logged in to Azure.");

Write-Title('STEP #2 - Choose Subscription');

WriteInfoLog("Fetching List of Subscriptions in Users Account");

$subscriptionList = ((az account list --all --output json) | ConvertFrom-Json);
if(!$subscriptionList)
{
    $message = "Encountered an Error while trying to fetch Subscription List.";
    ThrowException($message);
}

WriteInfoLog($($subscriptionList | ConvertTo-Json -Compress));

$subscriptionCount = 0;
foreach ($subscription in $subscriptionList) {
    $subscriptionCount += 1;
}

WriteInfoLog("Count of Subscriptions: " + $subscriptionCount);


if ($subscriptionCount -eq 0) {
    ThrowException("Please create atlease ONE Subscription in your Azure Account");
}
if ($subscriptionCount -eq 1) {
    $subscriptionName = $subscriptionList[0].name;
    WriteInfoLog("Defaulting to Subscription with Name: " + $subscriptionName);
}
else {   
    $subscriptionListOutput = az account list --output table --all --query "[].{Name:name, Id:id IsDefault:isDefault}"
    $subscriptionListOutput;
    Write-Host '';
    Write-Host '';
    $subscriptionName = Read-Host 'Enter Subscription Name from Above List'
    WriteInfoLog("User Entered Subscription Name: " + $subscriptionName);

}

$isValidSubscriptionName = $false;
foreach ($subscription in $subscriptionList) {
    if($subscription.name -ceq $subscriptionName)
    {
        $isValidSubscriptionName = $true;
        $userEmailAddress = $subscription.user.name;
    }
}

if(!$isValidSubscriptionName)
{
    $message = "Invalid Subscription Name Entered.";
    ThrowException($message);
}

$setSubscriptionNameOp = (az account set --subscription $subscriptionName)
#Intentionally not catching an exception here since the set subscription commands behavior (output) is different from others


WriteInfoLog("Fetching List of Locations");
Write-Title("STEP #3 - Choose Location");

$locationList = (az account list-locations) | ConvertFrom-Json;
WriteInfoLog($($locationList | ConvertTo-Json -Compress));
az account list-locations --output table --query "[].{Name:name}"

Write-Host '';
Write-Host '';
$locationName = Read-Host 'Enter Location From Above List for Resource Provisioning'
WriteInfoLog('User Entered Location Name: ' + $locationName);
$isValidLocationName = $false;
foreach ($location in $locationList) {
    if($location.name -ceq $locationName)
    {
        $isValidLocationName = $true;
    }
}

if(!$isValidLocationName)
{
    $message = "Invalid Location Name Entered.";
    ThrowException($message);
}


Write-Title('STEP #4 - Registering Azure Active Directory App');

WriteInfoLog("Creating AAD App with Name: " + $appName);
$appinfo=$(az ad app create --display-name $appName) | ConvertFrom-Json;
if(!$appinfo)
{
    $message = "Encountered an Error while creating AAD App";
    ThrowException($message);
}
$identifierURI = "api://$($appinfo.appId)";
WriteInfoLog("Updating Identifier URI's in AAD App to: "+  "api://$($appinfo.appId)");
$appUpdateOp = az ad app update --id $appinfo.appId --identifier-uris $identifierURI;
#Intentionally not catching an exception here since the app update commands behavior (output) is different from others

WriteInfoLog("Updating App so as to add MS Graph -> User Profile -> Read Permissions to the AAD App");
$appPermissionAddOp = az ad app permission add --id $appinfo.appId --api $graphAPIId --api-permissions $graphAPIPermissionId;
#Intentionally not catching an exception here

Write-Host 'App Created Successfully';

Write-Title('STEP #5 - Creating Resource Group');

WriteInfoLog("Creating Resource Group with Name : " + $resourceGroupName + " at Location: " + $locationName);
$resourceGroupCreationOp = az group create -l $locationName -n $resourceGroupName
if(!$resourceGroupCreationOp)
{
    $message = "Encountered an Error while creating Resource Group with Name : " + $resourceGroupName + " at Location: " + $locationName + ". One Reason could be that the Resource Group with the same name but different location already exists in your Subscription. Delete the other Resource Group and run this script again.";
    ThrowException($message);
}

Write-Host 'Resource Group Created Successfully';

Write-Title('STEP #6 - Creating Managed Identity');

WriteInfoLog("Creating Managed identity inside ResourceGroup: " + $resourceGroupName + " and Identity Name: " + $identityName);
$identityObj = (az identity create -g $resourceGroupName -n $identityName) | ConvertFrom-Json
if(!$identityObj)
{
    $message = "Encountered an Error while creating managed identity inside ResourceGroup: " + $resourceGroupName + " and Identity Name: " + $identityName;
    ThrowException($message);
}

#It takes a few seconds for the Managed Identity to spin up and be available for further processing
WriteInfoLog("Sleeping for 30 seconds");
Start-Sleep -s 30
Write-Host 'Managed Identity Created Successfully';

Write-Title('STEP #7 - Creating Role Assignment');

WriteInfoLog("Assigning Role: " + $roleName + " to PrincipalID: " + $identityObj.principalId);
$roleAssignmentOp = az role assignment create --assignee-object-id $identityObj.principalId --assignee-principal-type ServicePrincipal --role $roleName
if(!$roleAssignmentOp)
{
    $message = "Encountered an Error while creating Role Assignment";
    ThrowException($message);
}

Write-Host 'Role Assignment Created Successfully';

Write-Title('STEP #8 - Deploying Resources to Azure');

WriteInfoLog("Deploying ARM Template to Azure inside ResourceGroup: " + $resourceGroupName + " with DeploymentName: " + $deploymentName +  " TemplateFile: " + $templateFileName + " AppClientId: " + $appinfo.appId + " IdentifiedURI: " + $appinfo.identifierUris);
$deploymentOutput = (az deployment group create --resource-group $resourceGroupName --name $deploymentName --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($identifierURI) identityName=$($identityName) userEmailAddress=$($userEmailAddress)) | ConvertFrom-Json;
if(!$deploymentOutput)
{
    $message = "Encountered an Error while deploying to Azure";
    ThrowException($message);
}

Write-Host 'Deployment to Azure Completed Successfully';

Write-Title('STEP #9 - Updating AAD App');

WriteInfoLog("Updating App with ID: " + $appinfo.appId + " to Redirect URL: " +  $deploymentOutput.properties.outputs.webClientURL.value + " and also enabling Implicit Flow");
$appUpdateRedirectUrlOp = az ad app update --id $appinfo.appId --reply-urls $deploymentOutput.properties.outputs.webClientURL.value --oauth2-allow-implicit-flow true
#Intentionally not catching an exception here since the app update commands behavior (output) is different from others

Write-Host 'App Update Completed Successfully';

Write-Title('=========Successfully Deployed Resources to Azure============');
WriteInfoLog("Deployment Complete");
Stop-Transcript;

$exit = Read-Host 'Press any Key to Exit'