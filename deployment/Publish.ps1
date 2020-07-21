# GLOBALS
$VALID_FUNCTIONS =  @("LearnContent", "Links", "Assignments", "Connect", "Platforms", "Users")
$VALID_CLIENT = "learnclient"

# TODO: Move helpers to common file
function Write-Log {
    param(
        [Parameter(Mandatory)]
        [string]$Message
    ) 
    $now = (Get-Date).ToString();
    Write-Host "[$now] - $Message";
}

function Write-Title {
    param(
        [Parameter(Mandatory)]
        [string]$Title
    )
    Write-Host ''
    Write-Host ''
    Write-Host '============================================================='
    Write-Host $Title
    Write-Host '============================================================='
    Write-Host ''
    Write-Host ''    
}

function Get-FunctionApps ([string]$ResourceGroupName) {
    $PotentialFunctionApps = az functionapp list -g $ResourceGroupName | ConvertFrom-Json
    if (!$PotentialFunctionApps) {
        throw "Could not find any Function Apps in $ResourceGroupName"
    }
    
    $FunctionApps = @{}
    $FunctionAppNames = $PotentialFunctionApps | Select-Object -ExpandProperty "name";
    foreach ($FunctionLabel in $VALID_FUNCTIONS) {
        $FunctionAppName = $FunctionAppNames | Where-Object { $_ -like "$FunctionLabel-*" }
        if($FunctionAppName) {
            $FunctionApps["$($FunctionLabel)FunctionAppName"] = $FunctionAppName;
        }
    }
    return $FunctionApps
}

function Get-StaticWebsite ([string]$ResourceGroupName) {
    $storageAccounts = az storage account list -g $ResourceGroupName | ConvertFrom-Json
    if (!$storageAccounts -or ($storageAccounts.Count -le $VALID_FUNCTIONS.Count)) {
        throw "Could not find any Storage Accounts in $ResourceGroupName"
    }
    return $storageAccounts | 
        Where-Object { $_.name -like "$VALID_CLIENT*" } | 
        Select-Object -Property "name", @{label="WebUrl"; expression={ $_.primaryEndpoints.web }} 
}

function Get-DeployedResourceInfo {
    # Creates the Deployment object based on One Click Deployment strategy
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string]$AppName
    )
    # PREREQ: user is logged into azure-cli and is on correct subscription
    Write-Title 'Gathering Deployment Info'

    Write-Log 'Validating App Registration'
    #$app = az ad sp list --display-name $AppName | ConvertFrom-Json
    $app = az ad app list --display-name $AppName | ConvertFrom-Json
    if (!$app) {
        throw "Application $AppName could not be found"
    }

    Write-Log 'Validating Resource Group'
    $resourceGroup = az group show -n $ResourceGroupName | ConvertFrom-Json
    if (!$resourceGroup) {
        throw "Resource Group $ResourceGroupName could not be found"
    }

    Write-Log 'Getting Function Apps Info'
    $functionApps = Get-FunctionApps $ResourceGroupName
    if (!$functionApps) {
        throw "Couldn't get required Function Apps from $ResourceGroupName"
    }

    Write-Log 'Getting Static Website Info'
    $staticWebsite = Get-StaticWebsite $ResourceGroupName
    if (!$staticWebsite) {
        throw "Couldn't get Static Website Resource from $ResourceGroupName"
    }

    Write-Title 'Deployment Info Gathered'
    return @{
        "resource-group"=$resourceGroupName;
        "function-apps"=$functionApps;
        "static-website"=$staticWebsite;
        "app-id"=$app.appId
    }
}


$resources = Get-DeployedResourceInfo "MSLearnLTI-07202020" "MS-Learn-Lti-Tool-App-MSLearnLTI-07202020"

Import-Module ".\Install-Backend.ps1"

Write-Title "Installing the backend"
$BackendParams = @{
    SourceRoot="../backend";
    ResourceGroupName="$($resources['resource-group'])";
}
$BackendParams = $BackendParams + $resources['function-apps']
Install-Backend @BackendParams
Write-Title 'Backend Installation Completed'

Import-Module ".\Install-Client.ps1"

Write-Title "Updating the Client Config"
$ClientUpdateConfigParams = @{
    ConfigFilePath="../client/.env.production";
    ResourceGroupName="$($resources['resource-group'])";
    AppId="$($resources['app-id'])";
    StaticWebsiteUrl="$($($resources['static-website']).WebUrl)";
}
$ClientUpdateConfigParams = $ClientUpdateConfigParams + $resources['function-apps']
$ClientUpdateConfigParams.Remove("ConnectFunctionAppName")
Update-ClientConfig @ClientUpdateConfigParams
Write-Title "Client Config updated"

Write-Title 'Installing the client'
Install-Client -SourceRoot "../client" -StaticWebsiteStorageAccount $($resources['static-website']).name
Write-Title 'Client Installation Completed'

# Check if running Powershell ISE
if ($psISE) {
    Write-Host -NoNewLine 'Script is done';
} else {
    Write-Host -NoNewLine 'Press any key to continue...';
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}