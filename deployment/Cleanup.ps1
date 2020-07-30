[CmdletBinding()]
param (
    [string]$ResourceGroupName = "MSLearnLTI",
    [string]$AppName = "MS-Learn-Lti-Tool-App",
    [string]$IdentityName = "MSLearnLTI-Identity",
    [switch]$UseActiveAzureAccount,
    [string]$SubscriptionName = $null
)

process {
    function Write-Title([string]$Title) {
        Write-Host "`n`n============================================================="
        Write-Host $Title
        Write-Host "=============================================================`n`n"
    }

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
            [string]$Name,
            $List
        )
        
        $subscription = ($List | Where-Object { $_.name -ceq $Name })
        if(!$subscription) {
            throw "Invalid Subscription Name Entered."
        }
        az account set --subscription $Name
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
    elseif ($SubscriptionName) {
        Write-Log -Message "Using User provided Subscription Name: $SubscriptionName"            
    }
    elseif ($SubscriptionCount -eq 1) {
        $SubscriptionName = $SubscriptionList[0].name;
        Write-Log -Message "Defaulting to Subscription Name: $SubscriptionName"
    }
    else {
        $SubscriptionListOutput = $SubscriptionList | Select-Object @{ l="Subscription Name"; e={ $_.name } }, "id", "isDefault"
        Write-Host ($SubscriptionListOutput | Out-String)
        $SubscriptionName = Read-Host 'Enter Subscription Name from Above List'
        Write-Log -Message "User Entered Subscription Name: $SubscriptionName"
    }

    $ActiveSubscription = Set-LtiActiveSubscription -Name $SubscriptionName -List $SubscriptionList
    #endregion

    #region Delete Managed Identity, if Exists
    $Identity = ((az identity list --resource-group $ResourceGroupName) | ConvertFrom-Json) | Where-Object { $_.name -ieq $IdentityName }
    if (!$Identity) {
        throw "Unable to find a managed identity with name [ $IdentityName ]"
    }

    Write-Title 'STEP #3 - Remove Identity as Contributor from Subscription'
    az role assignment delete --assignee "$($Identity.principalId)" --role 'Contributor'
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to remove Identity [ $IdentityName ] as Contributor"
    }
    
    Write-Title 'STEP #4 - Delete Managed Identity'
    az identity delete --name $IdentityName --resource-group $ResourceGroupName
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to delete Managed Identity [ $IdentityName ]"
    }
    #endregion
    
    #region Delete Resource Group, if Exists
    Write-Title 'STEP #4 - Delete Resource Group'
    az group delete --name $ResourceGroupName --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to delete Resource Group [ $ResourceGroup ] and its Child Resources"
    }
    #endregion

    #region Delete App Registration, if Exists
    Write-Title 'STEP #5 - Delete App Registration'
    $AppInfo = (az ad app list --display-name $AppName) | ConvertFrom-Json
    if (!$AppInfo) {
        throw "Unable to find App Registration with Name [ $AppName ]"
    }
    az ad app delete --id $AppInfo.appId
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to delete AAD App [ $AppName ]"
    }
    #endregion
}