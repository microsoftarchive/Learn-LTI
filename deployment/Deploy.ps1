[CmdletBinding()]
param (
    [string]$ResourceGroupName = "MSLearnLTI",
    [string]$AppName = "MS-Learn-Lti-Tool-App",
    [string]$IdentityName = "MSLearnLTI-Identity",
    [switch]$UseActiveAzureAccount,
    [string]$SubscriptionName = $null,
    [string]$LocationName=$null
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
                [string]$Name,
                $List
            )
            
            $subscription = ($List | Where-Object { $_.name -ieq $Name })
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
            Write-Log -Message "User Entered Location Name: $LocationName"
        }

        $ValidLocation = $LocationList | Where-Object { $_.name -ieq $LocationName }
        if(!$ValidLocation) {
            throw "Invalid Location Name Entered."
        }
        #endregion
    
        #region Create New App Registration in AzureAD
        Write-Title 'STEP #4 - Registering Azure Active Directory App'
    
        Write-Log -Message "Creating AAD App with Name: $AppName"
        $appinfo=$(az ad app create --display-name $AppName) | ConvertFrom-Json;
        if(!$appinfo) {
            throw "Encountered an Error while creating AAD App"
        }
        $identifierURI = "api://$($appinfo.appId)";
        Write-Log -Message "Updating Identifier URI's in AAD App to: [ api://$($appinfo.appId) ]"
        $appUpdateOp = az ad app update --id $appinfo.appId --identifier-uris $identifierURI;
        #Intentionally not catching an exception here since the app update commands behavior (output) is different from others
    
        Write-Log -Message "Updating App so as to add MS Graph -> User Profile -> Read Permissions to the AAD App"
        $GraphAPIId = '00000003-0000-0000-c000-000000000000'
        $GraphAPIPermissionId = 'e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope'
        $appPermissionAddOp = az ad app permission add --id $appinfo.appId --api $GraphAPIId --api-permissions $GraphAPIPermissionId
        #Intentionally not catching an exception here
    
        Write-Host 'App Created Successfully'
        #endregion
    
        #region Create New Resource Group in above Region
        Write-Title 'STEP #5 - Creating Resource Group'
    
        Write-Log -Message "Creating Resource Group with Name: $ResourceGroupName at Location: $LocationName"
        $resourceGroupCreationOp = az group create -l $LocationName -n $ResourceGroupName
        if(!$resourceGroupCreationOp) {
            $ex = @(
                "Error while creating Resource Group with Name : [ $ResourceGroupName ] at Location: [ $LocationName ]."
                "One Reason could be that a Resource Group with same name but different location already exists in your Subscription."
                "Delete the other Resource Group and run this script again."
            ) -join ' '
            throw $ex
        }
    
        Write-Host 'Resource Group Created Successfully'
        #endregion

        #region Create new Managed Contrbuter for deploying resources via ARM template
        Write-Title 'STEP #6 - Creating Managed Identity'

        Write-Log -Message "Creating Managed Identity inside ResourceGroup [ $ResourceGroupName ] with Name [ $IdentityName ]"
        $identityObj = (az identity create -g $ResourceGroupName -n $IdentityName) | ConvertFrom-Json
        if(!$identityObj) {
            throw "Error while creating Managed Identity inside ResourceGroup [ $ResourceGroupName ] with Name [ $IdentityName ]" 
        }
    
        #It takes a few seconds for the Managed Identity to spin up and be available for further processing
        Write-Log -Message "Sleeping for 30 seconds"
        Start-Sleep -s 30
        Write-Host 'Managed Identity Created Successfully'

        Write-Title 'STEP #7 - Creating Role Assignment'
    
        $roleName = "Contributor"
        Write-Log -Message "Assigning Role: $roleName to PrincipalID: $($identityObj.principalId)"
        $roleAssignmentOp = az role assignment create --assignee-object-id $identityObj.principalId --assignee-principal-type ServicePrincipal --role $roleName
        if(!$roleAssignmentOp) {
            throw "Encountered an Error while creating Role Assignment"
        }
    
        Write-Host 'Role Assignment Created Successfully';
        #endregion

        #region Provision Resources inside Resource Group on Azure using ARM template
        Write-Title 'STEP #8 - Creating Resources in Azure'
    
        $userObjectId = az ad signed-in-user show --query objectId
        #$userObjectId
    
        $templateFileName = "azuredeploy.json"
        $deploymentName = "Deployment-$ExecutionStartTime"
        Write-Log -Message "Deploying ARM Template to Azure inside ResourceGroup: $ResourceGroupName with DeploymentName: $deploymentName, TemplateFile: $templateFileName, AppClientId: $($appinfo.appId), IdentifiedURI: $($appinfo.identifierUris)"
        $deploymentOutput = (az deployment group create --resource-group $ResourceGroupName --name $deploymentName --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($identifierURI) identityName=$($IdentityName) userEmailAddress=$($UserEmailAddress) userObjectId=$($userObjectId)) | ConvertFrom-Json;
        if(!$deploymentOutput) {
            throw "Encountered an Error while deploying to Azure"
        }
    
        function Update-LtiFunctionAppSettings([string]$ResourceGroupName, [string]$FunctionAppName, [hashtable]$AppSettings) {
            Write-Log -Message "Updating App Settings for Function App [ $FunctionAppName ]: -"
            foreach ($it in $AppSettings.GetEnumerator()) {
                Write-Log -Message "`t[ $($it.Name) ] = [ $($it.Value) ]"
                az functionapp config appsettings set --resource-group $ResourceGroupName --name $FunctionAppName --settings "$($it.Name)=$($it.Value)"
            }
        }
    
        #Updating the Config Entry EdnaLiteDevKey in the Function Config
        $KeyVaultLink=$(az keyvault key show --vault-name $deploymentOutput.properties.outputs.KeyVaultName.value --name EdnaLiteDevKey --query 'key.kid' -o json);
        $EdnaKeyString = @{ "EdnaKeyString"="$KeyVaultLink" }
        $ConnectUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.ConnectFunctionName.value $EdnaKeyString
        $PlatformsUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.PlatformsFunctionName.value $EdnaKeyString
        $UsersUpdateOp = Update-LtiFunctionAppSettings $ResourceGroupName $deploymentOutput.properties.outputs.UsersFunctionName.value $EdnaKeyString
    
        Write-Host 'Resource Creation in Azure Completed Successfully'

        Write-Title 'STEP #9 - Updating AAD App'
    
        $AppRedirectUrl = $deploymentOutput.properties.outputs.webClientURL.value
        Write-Log -Message "Updating App with ID: $($appinfo.appId) to Redirect URL: $AppRedirectUrl and also enabling Implicit Flow"
        $appUpdateRedirectUrlOp = az ad app update --id $appinfo.appId --reply-urls $AppRedirectUrl --oauth2-allow-implicit-flow true
        #Intentionally not catching an exception here since the app update commands behavior (output) is different from others
    
        Write-Host 'App Update Completed Successfully'
        #endregion

        #region Build and Publish Function Apps
        . .\Install-Backend.ps1
        Write-Title "STEP #10 - Installing the backend"
    
        $BackendParams = @{
            SourceRoot="../backend";
            ResourceGroupName=$ResourceGroupName;
            LearnContentFunctionAppName=$deploymentOutput.properties.outputs.LearnContentFunctionName.value;
            LinksFunctionAppName=$deploymentOutput.properties.outputs.LinksFunctionName.value;
            AssignmentsFunctionAppName=$deploymentOutput.properties.outputs.AssignmentsFunctionName.value;
            ConnectFunctionAppName=$deploymentOutput.properties.outputs.ConnectFunctionName.value;
            PlatformsFunctionAppName=$deploymentOutput.properties.outputs.PlatformsFunctionName.value;
            UsersFunctionAppName=$deploymentOutput.properties.outputs.UsersFunctionName.value;
        }
        Install-Backend @BackendParams
        #endregion

        #region Build and Publish Client Artifacts
        . .\Install-Client.ps1
        Write-Title "STEP #11 - Updating client's .env.production file"
    
        $ClientUpdateConfigParams = @{
            ConfigPath="../client/.env.production";
            AppId=$appinfo.appId;
            LearnContentFunctionAppName=$deploymentOutput.properties.outputs.LearnContentFunctionName.value;
            LinksFunctionAppName=$deploymentOutput.properties.outputs.LinksFunctionName.value;
            AssignmentsFunctionAppName=$deploymentOutput.properties.outputs.AssignmentsFunctionName.value;
            PlatformsFunctionAppName=$deploymentOutput.properties.outputs.PlatformsFunctionName.value;
            UsersFunctionAppName=$deploymentOutput.properties.outputs.UsersFunctionName.value;
            StaticWebsiteUrl=$deploymentOutput.properties.outputs.webClientURL.value;
        }
        Update-ClientConfig @ClientUpdateConfigParams
    
        Write-Title 'STEP #12 - Installing the client'
        $ClientInstallParams = @{
            SourceRoot="../client";
            StaticWebsiteStorageAccount=$deploymentOutput.properties.outputs.StaticWebSiteName.value
        }
        Install-Client @ClientInstallParams
        #endregion

        Write-Title "TOOL REGISTRATION URL (Please Copy, Required for Next Steps) -> $($deploymentOutput.properties.outputs.webClientURL.value)platform"

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