# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

[CmdletBinding()]
param (
    [Parameter(Mandatory)]
    [string]$ResourceGroupName, # ~ "MSLearnLTI"
    [Parameter(Mandatory)]
    [string]$AppName            # ~ "MS-Learn-Lti-Tool-App"
)

begin {
    . .\Install-Backend.ps1
    . .\Install-Client.ps1
    # TODO: ensure that user is logged into azure-cli and has an active subscription
}

process {
    # GLOBALS
    $VALID_FUNCTIONS =  @("LearnContent", "Links", "Assignments", "Connect", "Platforms", "Users")
    $VALID_CLIENT = "learnclient"
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
    
    function Get-AppRegistration ([string]$AppName) {
        #$app = az ad sp list --display-name $AppName | ConvertFrom-Json
        $app = az ad app list --display-name $AppName | ConvertFrom-Json
        if (!$app) {
            throw "Application $AppName could not be found"
        }
        Write-Output $app
    }
    
    function Test-ResourceGroup ([string]$ResourceGroupName) {
        $resourceGroup = az group show -n $ResourceGroupName | ConvertFrom-Json
        if (!$resourceGroup) {
            throw "Resource Group $ResourceGroupName could not be found"
        }
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

    function Get-DeployedResourceInfo([string]$ResourceGroupName, [string]$AppName) {
        Write-Log 'Validating App Registration'
        $app = Get-AppRegistration $AppName
    
        Write-Log 'Validating Resource Group'
        Test-ResourceGroup $ResourceGroupName
    
        Write-Log 'Getting Function Apps Info'
        $FunctionApps = Get-FunctionApps $ResourceGroupName
        if (!$FunctionApps) {
            throw "Couldn't get required Function Apps from $ResourceGroupName"
        }
    
        Write-Log 'Getting Static Website Info'
        $StaticWebsite = Get-StaticWebsite $ResourceGroupName
        if (!$StaticWebsite) {
            throw "Couldn't get Static Website Resource from $ResourceGroupName"
        }
    
        return @{
            "resource-group"=$resourceGroupName;
            "function-apps"=$FunctionApps;
            "static-website"=$StaticWebsite;
            "app-id"=$app.appId
        }
    }
    
    . .\Write-Log.ps1   # Resolves Write-Log function

    Write-Title 'Gathering Deployment Info'
    $resources = Get-DeployedResourceInfo -ResourceGroupName $ResourceGroupName -AppName $AppName
    Write-Title 'Deployment Info Gathered'
    
    Write-Title "Installing the backend"
    $BackendParams = @{
        SourceRoot="../backend";
        ResourceGroupName="$($resources['resource-group'])";
    }
    $BackendParams = $BackendParams + $resources['function-apps']
    Install-Backend @BackendParams

    Write-Title "Updating the Client Config"
    $ClientUpdateConfigParams = @{
        ConfigPath="../client/.env.production";
        AppId="$($resources['app-id'])";
        StaticWebsiteUrl="$($($resources['static-website']).WebUrl)";
    }
    $ClientUpdateConfigParams = $ClientUpdateConfigParams + $resources['function-apps']
    $ClientUpdateConfigParams.Remove("ConnectFunctionAppName")
    Update-ClientConfig @ClientUpdateConfigParams
    
    Write-Title 'Installing the client'
    Install-Client -SourceRoot "../client" -StaticWebsiteStorageAccount $($resources['static-website']).name
    
    # Check if running Powershell ISE
    if ($psISE) {
        Write-Host -NoNewLine 'Script is done';
    } else {
        Write-Host -NoNewLine 'Press any key to continue...';
        $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
