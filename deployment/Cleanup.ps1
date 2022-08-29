# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

[CmdletBinding()]
param (
    [string]$ResourceGroupName = "MSLearnLti",
    [string]$AppName = "MS-Learn-Lti-Tool-App",
    [switch]$UseActiveAzureAccount,
    [string]$SubscriptionNameOrId = $null
)

process {
    #region "Helper Functions"
    #function for making clear and distinct titles
    function Write-Title([string]$Title) {
        Write-Host "`n`n============================================================="
        Write-Host $Title
        Write-Host "=============================================================`n`n"
    }

    #function for making coloured outputs
    function Write-Color($Color, [string]$Text) {
        Write-Host $Text -ForegroundColor $Color
    }

    #function for writing errors
    function Write-Error([string]$Text) {
        Write-Host "`n`n=============================================================`n" -ForegroundColor "red" -BackgroundColor "black" -NoNewline
        Write-Host "Error!`n$Text" -ForegroundColor "red" -BackgroundColor "black" -NoNewline
        Write-Host "`n=============================================================" -ForegroundColor "red" -BackgroundColor "black"
    }
    #endregion

    #region "exception handling classes"
    class InvalidAzureSubscriptionException: System.Exception{
        $Emessage
        InvalidAzureSubscriptionException([string]$msg){
            $this.Emessage=$msg
        }
    }
    #endregion

    #region Show Learn LTI Banner
    Write-Host ''
    Write-Host ' _      ______          _____  _   _            _   _______ _____ '
    Write-Host '| |    |  ____|   /\   |  __ \| \ | |          | | |__   __|_   _|'
    Write-Host '| |    | |__     /  \  | |__) |  \| |  ______  | |    | |    | |  '
    Write-Host '| |    |  __|   / /\ \ |  _  /| . ` | |______| | |    | |    | |  '
    Write-Host '| |____| |____ / ____ \| | \ \| |\  |          | |____| |   _| |_ '
    Write-Host '|______|______/_/    \_\_|  \_\_| \_|          |______|_|  |_____|'
    Write-Host ''
    Write-Host ''
    #endregion

    #region Setup Logging
    . .\Write-Log.ps1
    $ScriptPath = split-path -parent $MyInvocation.MyCommand.Definition
    $ExecutionStartTime = $(get-date -f dd-MM-yyyy-HH-mm-ss)
    $LogRoot = Join-Path $ScriptPath "Log"

    $LogFile = Join-Path $LogRoot "Log-$ExecutionStartTime.log"
    Set-LogFile -Path $LogFile
    
    $TranscriptFile = Join-Path $LogRoot "Transcript-$ExecutionStartTime.log"
    Start-Transcript -Path $TranscriptFile;
    #endregion
    
    #region B2c if needed
    Write-Title "Optional B2C cleanup"
    $b2ccleanup = "none"
    while($b2ccleanup -ne "y" -and $b2ccleanup -ne "n") {
        $b2ccleanup = Read-Host "Would you like to to cleanup a B2C tenant? (y/n)"
    }
    
    if($b2ccleanup -eq "y")
    {
        Write-Title "B2C Step #0 - Running B2C Cleanup Script"
        & ".\B2CCleanup.ps1"
    }
    #endregion
    

    #region Login to Azure CLI
    Write-Title 'STEP #1 - Logging into Azure'

    function Test-LtiActiveAzAccount {
        $account = az account show | ConvertFrom-Json
        if(!$account) {
            throw "Error while trying to get Active Account Info."
        }            
    }

    function Connect-LtiAzAccount {
        $loginOp = az login | ConvertFrom-Json
        if(!$loginOp) {
            throw "Encountered an Error while trying to Login."
        }
    }

    if ($UseActiveAzureAccount) { 
        Write-Log -Message "Using Active Azure Account"
        Test-LtiActiveAzAccount
    }
    else { 
        Write-Log -Message "Logging in to Azure"
        Connect-LtiAzAccount
    }

    Write-Log -Message "Successfully logged in to Azure."    
    #endregion

    #region Choose Active Subscription
    Write-Title 'STEP #2 - Choose Subscription'

    function Get-LtiSubscriptionList {
        $AzAccountList = ((az account list --all --output json) | ConvertFrom-Json)
        if(!$AzAccountList) {
            throw "Encountered an Error while trying to fetch Subscription List."
        }
        Write-Output $AzAccountList
    }

    function Set-LtiActiveSubscription {
        param (
            [string]$NameOrId,
            $List
        )
        
        $subscription = ($List | Where-Object { ($_.name -ieq $NameOrId) -or ($_.id -ieq $NameOrId) })
        if(!$subscription) {
            throw [InvalidAzureSubscriptionException] "Invalid Subscription Name/ID Entered."
        }
        az account set --subscription $NameOrId
        #Intentionally not catching an exception here since the set subscription commands behavior (output) is different from others
        
        Write-Output $subscription
    }

    Write-Log -Message "Fetching List of Subscriptions in Users Account"
    $SubscriptionList = Get-LtiSubscriptionList
    Write-Log -Message "List of Subscriptions:-`n$($SubscriptionList | ConvertTo-Json -Compress)"    

    $SubscriptionCount = ($SubscriptionList | Measure-Object).Count
    Write-Log -Message "Count of Subscriptions: $SubscriptionCount"
    if ($SubscriptionCount -eq 0) {
        throw "Please create at least ONE Subscription in your Azure Account"
    }
    elseif ($SubscriptionNameOrId) {
        Write-Log -Message "Using User provided Subscription Name/ID: $SubscriptionNameOrId"            
    }
    elseif ($SubscriptionCount -eq 1) {
        $SubscriptionNameOrId = $SubscriptionList[0].id;
        Write-Log -Message "Defaulting to Subscription ID: $SubscriptionNameOrId"
    }
    else {
        $SubscriptionListOutput = $SubscriptionList | Select-Object @{ l="Subscription Name"; e={ $_.name } }, "id", "isDefault"
        Write-Host ($SubscriptionListOutput | Out-String)
        $SubscriptionNameOrId = Read-Host 'Enter the Name or ID of the Subscription from Above List'
        #trimming the input for empty spaces, if any
        $SubscriptionNameOrId = $SubscriptionNameOrId.Trim()
        Write-Log -Message "User Entered Subscription Name/ID: $SubscriptionNameOrId"
    }

    #defensive programming so script doesn't halt and require a cleanup if subscription is mistyped
    while(1){
        try{
            $ActiveSubscription = Set-LtiActiveSubscription -NameOrId $SubscriptionNameOrId -List $SubscriptionList
            break
        }
        catch [InvalidAzureSubscriptionException]{
            Write-Error $Error[0]
            $SubscriptionNameOrId = Read-Host 'Enter the Name or ID of the Subscription from Above List'
            #trimming the input for empty spaces, if any
            $SubscriptionNameOrId = $SubscriptionNameOrId.Trim()
            Write-Log -Message "User Entered Subscription Name/ID: $SubscriptionNameOrId"
        }
    }
    
    #endregion
    
    #region Delete Resource Group, if Exists
    Write-Title 'STEP #3 - Delete Resource Group'
    az group delete --name $ResourceGroupName --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to delete Resource Group [ $ResourceGroupName ] and its Child Resources"
    }
    Write-Host 'Resource Group Deleted Successfully'
    #endregion

    #region Delete App Registration, if Exists
    Write-Title 'STEP #4 - Delete App Registration'
    $AppInfo = (az ad app list --display-name $AppName) | ConvertFrom-Json
    if (!$AppInfo) {
        throw "Unable to find App Registration with Name [ $AppName ]"
    }
    az ad app delete --id $AppInfo.appId
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to delete AAD App [ $AppName ]"
    }
    Write-Host 'App Registration Deleted Successfully'
    #endregion

    Write-Title '======== Successfully Deleted Resources from Azure ==========='

    Write-Log -Message "Clean-up Complete"
    Write-Warning 'Please use a different ResourceGroup name on re-deployment!'
}