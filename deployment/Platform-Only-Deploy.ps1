# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------


#Things to update 
## Resource group name and app nam
## $EdnaKeyString = @{ "EdnaKeyString"="$KeyVaultLink" } # RB: this thing here, can get from current list 


[CmdletBinding()]
param (
    [string]$ResourceGroupName = "RB_a2_MSLearnLTI",
    [string]$AppName = "RB_a2_MS-Learn-Lti-Tool-App",
    [switch]$UseActiveAzureAccount,
    [string]$SubscriptionNameOrId = $null,
    [string]$LocationName = $null
)

process {
    function Write-Title([string]$Title) {
        Write-Host "`n`n============================================================="
        Write-Host $Title
        Write-Host "=============================================================`n`n"
    }
    
    try {

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

        #region Choose Active Subcription 
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
                throw "Invalid Subscription Name/ID Entered."
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

        $ActiveSubscription = Set-LtiActiveSubscription -NameOrId $SubscriptionNameOrId -List $SubscriptionList
        $UserEmailAddress = $ActiveSubscription.user.name
        #endregion

        #region Choose Region for Deployment
        Write-Title "STEP #3 - Choose Location`n(Please refer to the Documentation / ReadMe on Github for the List of Supported Locations)"

        Write-Log -Message "Fetching List of Locations"
        $LocationList = ((az account list-locations) | ConvertFrom-Json)
        Write-Log -Message "List of Locations:-`n$($locationList | ConvertTo-Json -Compress)"

        if(!$LocationName) {
            Write-Host "$(az account list-locations --output table --query "[].{Name:name}" | Out-String)`n"
            $LocationName = Read-Host 'Enter Location From Above List for Resource Provisioning'
            #trimming the input for empty spaces, if any
            $LocationName = $LocationName.Trim()
        }
        Write-Log -Message "User Provided Location Name: $LocationName"

        $ValidLocation = $LocationList | Where-Object { $_.name -ieq $LocationName }
        if(!$ValidLocation) {
            throw "Invalid Location Name Entered."
        }
        #endregion
    
        #region Create New App Registration in AzureAD
        # RB remove -- don't need to register a new app 
        # maybe hardcode? 
        Write-Title 'STEP #4 - Registering Azure Active Directory App'

        # do i need to hardccode this appinfo.appId
        #$appinfo=$(az ad app create --display-name $AppName) | ConvertFrom-Json;
        #if(!$appinfo) {
        #    throw "Encountered an Error while creating AAD App"
        #}

        #$identifierURI = "api://$($appinfo.appId)";
        #Write-Log -Message "Updating Identifier URI's in AAD App to: [ api://$($appinfo.appId) ]"
        #$appUpdateOp = az ad app update --id $appinfo.appId --identifier-uris $identifierURI;
        #Intentionally not catching an exception here since the app update commands behavior (output) is different from others
        #Intentionally not catching an exception here
    
        Write-Host 'App Created Successfully'
        #endregion
    
        #region Create New Resource Group in above Region
        Write-Title 'STEP #5 - Creating Resource Group'
    
        Write-Host 'Resource Group Created Successfully'

        #endregion

        #region Provision Resources inside Resource Group on Azure using ARM template
        Write-Title 'STEP #6 - Creating Resources in Azure'
    
        $userObjectId = az ad signed-in-user show --query objectId
        #$userObjectId
    
        $templateFileName = "azuredeploy.json"
        $deploymentName = "Deployment-$ExecutionStartTime"

        $templateFileName = "azuredeploy.json"
        $deploymentName = "Deployment-$ExecutionStartTime"
        Write-Log -Message "Deploying ARM Template to Azure inside ResourceGroup: $ResourceGroupName with DeploymentName: $deploymentName, TemplateFile: $templateFileName, AppClientId: $($appinfo.appId), IdentifiedURI: $($appinfo.identifierUris)"
        $deploymentOutput = (az deployment group create --resource-group $ResourceGroupName --name $deploymentName --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($identifierURI) userEmailAddress=$($UserEmailAddress) userObjectId=$($userObjectId)) | ConvertFrom-Json;
        if(!$deploymentOutput) {
            throw "Encountered an Error while deploying to Azure"
        }

        Write-Host 'Resource Creation in Azure Completed Successfully'
        
        Write-Title 'Step #7 - Updating KeyVault with LTI 1.3 Key'

        

        function Update-LtiFunctionAppSettings([string]$ResourceGroupName, [string]$FunctionAppName, [hashtable]$AppSettings) {
            Write-Log -Message "Updating App Settings for Function App [ $FunctionAppName ]: -"
            foreach ($it in $AppSettings.GetEnumerator()) {
                Write-Log -Message "`t[ $($it.Name) ] = [ $($it.Value) ]"
                az functionapp config appsettings set --resource-group $ResourceGroupName --name $FunctionAppName --settings "$($it.Name)=$($it.Value)"
            }
        }
    
        #Creating EdnaLiteDevKey in keyVault and Updating the Config Entry EdnaLiteDevKey in the Function Config

        # RB might need to hardcode EdnaLiteDevKey? or somehow get it for the fucntion config? 
        
        #Creating EdnaLiteDevKey in keyVault and Updating the Config Entry EdnaLiteDevKey in the Function Config
        $keyCreationOp = (az keyvault key create --vault-name $deploymentOutput.properties.outputs.KeyVaultName.value --name EdnaLiteDevKey --protection software) | ConvertFrom-Json;
        if(!$keyCreationOp) {
            throw "Encountered an Error while creating Key in keyVault"
        }
        $KeyVaultLink = $keyCreationOp.key.kid
        $EdnaKeyString = @{ "EdnaKeyString"="$KeyVaultLink" }

        # $EdnaKeyString = @{ "EdnaKeyString"="$KeyVaultLink" } # RB: this thing here, can get from current list 
        #$EdnaKeyString ="https://kv-y6k3b3zud.vault.azure.net/keys/EdnaLiteDevKey/3a3424ec481c43a2944c13ff42e4ae5c" 
        
        $ConnectUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.ConnectFunctionName.value $EdnaKeyString
        $PlatformsUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.PlatformsFunctionName.value $EdnaKeyString
        $UsersUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.UsersFunctionName.value $EdnaKeyString
        #endregion

        #region Build and Publish Function Apps
        . .\Platform-Only-Backend.ps1
        Write-Title "STEP #10 - Installing the backend"
    

        # RB maybe tweak to only one of these? 
        $BackendParams = @{
            SourceRoot="../backend";
            ResourceGroupName=$ResourceGroupName;
            #LearnContentFunctionAppName=$deploymentOutput.properties.outputs.LearnContentFunctionName.value;
            #LinksFunctionAppName=$deploymentOutput.properties.outputs.LinksFunctionName.value;
            #AssignmentsFunctionAppName=$deploymentOutput.properties.outputs.AssignmentsFunctionName.value;
            #ConnectFunctionAppName=$deploymentOutput.properties.outputs.ConnectFunctionName.value;
            PlatformsFunctionAppName=$deploymentOutput.properties.outputs.PlatformsFunctionName.value;
            #UsersFunctionAppName=$deploymentOutput.properties.outputs.UsersFunctionName.value;
        }
        Install-Backend @BackendParams
        #endregion

        #region Build and Publish Client Artifacts
        Write-Title '======== Successfully Deployed Resources to Azure ==========='

        Write-Log -Message "Deployment Complete"
    }
    catch {
        $Message = 'Error occurred while executing the Script. Please report the bug on Github (along with Error Message & Logs)'
        Write-Log -Message $Message -ErrorRecord $_
        throw $_
    }
    finally {
        Stop-Transcript
        $exit = Read-Host 'Press any Key to Exit'
    }
}