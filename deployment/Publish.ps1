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
    $functionApps = az functionapp list -g $ResourceGroupName | ConvertFrom-Json
    if (!$functionApps) {
        throw "Could not find any Function Apps in $ResourceGroupName"
    }
    
    $isValidFunctionApp = {
        $isValid = $false
        foreach ($functionLabel in $VALID_FUNCTIONS) {
            if ($_ -like "$functionLabel-*") {
                $isValid = $true
                break
            }
        }
        $isValid
    }
    # Write-Log $functionApps | 
    #     Select-Object "name", @{n="Url"; e={"https://$($_.defaultHostName)"}}, @{n="Label"; e={& $functionLabel}}

    return $functionApps | Select-Object -ExpandProperty "name" | Where-Object { & $isValidFunctionApp }
}

function Get-StaticWebsite ([string]$ResourceGroupName) {
    $storageAccounts = az storage account list -g $ResourceGroupName | ConvertFrom-Json
    if (!$storageAccounts -or ($storageAccounts.Count -le $VALID_FUNCTIONS.Count)) {
        throw "Could not find any Storage Accounts in $ResourceGroupName"
    }
    return $storageAccounts | Where-Object { $_.name -like "$VALID_CLIENT*" } | Select-Object -ExpandProperty "name"
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

. .\Install-Backend.ps1
Install-Backend "../backend" $resources['resource-group'] $resources['function-apps']

. .\Install-Client.ps1
Update-ClientConfig "../client/.env.production" $resources['resource-group'] $resources['function-apps'] $resources['app-id'] $resources['static-website']
Install-Client "../client" $resources['static-website']

# Check if running Powershell ISE
if ($psISE) {
    Write-Host -NoNewLine 'Script is done';
} else {
    Write-Host -NoNewLine 'Press any key to continue...';
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}