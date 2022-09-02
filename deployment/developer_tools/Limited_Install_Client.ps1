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

Write-Host -Message "Successfully logged in to Azure."
#endregion

#region Choose Active Subcription 
Write-Host 'STEP #2 - Choose Subscription'

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

Write-Host -Message "Fetching List of Subscriptions in Users Account"
$SubscriptionList = Get-LtiSubscriptionList
#Write-Host -Message "List of Subscriptions:-`n$($SubscriptionList | ConvertTo-Json -Compress)"    

$SubscriptionCount = ($SubscriptionList | Measure-Object).Count
#Write-Log -Message "Count of Subscriptions: $SubscriptionCount"
if ($SubscriptionCount -eq 0) {
    throw "Please create at least ONE Subscription in your Azure Account"
}
elseif ($SubscriptionNameOrId) {
    #Write-Log -Message "Using User provided Subscription Name/ID: $SubscriptionNameOrId"            
}
elseif ($SubscriptionCount -eq 1) {
    $SubscriptionNameOrId = $SubscriptionList[0].id;
    #Write-Log -Message "Defaulting to Subscription ID: $SubscriptionNameOrId"
}
else {
    $SubscriptionListOutput = $SubscriptionList | Select-Object @{ l="Subscription Name"; e={ $_.name } }, "id", "isDefault"
    Write-Host ($SubscriptionListOutput | Out-String)
    $SubscriptionNameOrId = Read-Host 'Enter the Name or ID of the Subscription from Above List'
    #trimming the input for empty spaces, if any
    $SubscriptionNameOrId = $SubscriptionNameOrId.Trim()
    #Write-Log -Message "User Entered Subscription Name/ID: $SubscriptionNameOrId"
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
$UserEmailAddress = $ActiveSubscription.user.name
#endregion



. .\Install-Client.ps1
Write-Host 'STEP #12 - Installing the client'  

$ClientInstallParams = @{
    SourceRoot="../client";
    StaticWebsiteStorageAccount="learnclient75ykpx5cf"
}
Install-Client @ClientInstallParams