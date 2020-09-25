# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

$scriptPath = split-path -parent $MyInvocation.MyCommand.Definition
$ExecutionStartTime = $(get-date -f dd-MM-yyyy-HH-mm-ss)
$LogRoot = Join-Path $scriptPath "Log"
$LogFile = Join-Path $LogRoot "Log-$ExecutionStartTime.log"
$resourceGroupName = "Canvas-ML-FilterTest2"
$identityName = "Canvas-ML-FilterTest2-Identity"
$appName = "Canvas-ML-FilterTest2-App"

function Write-LogInternal {
    param (
        [Parameter(Mandatory)]
        [String]$Message
    )
    
    $now = (Get-Date).ToString()
    $logMsg = "[ $now ] - $Message"
    $logMsg >> $LogFile

    # Print the output on the screen, if running verbose
    Write-Verbose -Message $logMsg
}

function Write-Log {
    param (
        [Parameter(Mandatory)]
        [string]$Message,
        $ErrorRecord
    )

    # credits: Tim Curwick for providing this insight
    if( $ErrorRecord -is [System.Management.Automation.ErrorRecord] ) {
        Write-LogInternal "[ERROR] - Exception.Message [ $($ErrorRecord.Exception.Message) ]"
        Write-LogInternal "[ERROR] - Exception.Type    [ $($ErrorRecord.Exception.GetType()) ]"
        Write-LogInternal "[ERROR] - $Message"
    }
    else {
        Write-LogInternal "[INFO] - $Message"
    }
}

function Write-Banner {
    Write-Host ''
    Write-Host ' _      ______          _____  _   _            _   _______ _____ '
    Write-Host '| |    |  ____|   /\   |  __ \| \ | |          | | |__   __|_   _|'
    Write-Host '| |    | |__     /  \  | |__) |  \| |  ______  | |    | |    | |  '
    Write-Host '| |    |  __|   / /\ \ |  _  /| . ` | |______| | |    | |    | |  '
    Write-Host '| |____| |____ / ____ \| | \ \| |\  |          | |____| |   _| |_ '
    Write-Host '|______|______/_/    \_\_|  \_\_| \_|          |______|_|  |_____|'
    Write-Host ''    
    Write-Host ''    
}

function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}

try {
    Write-Banner
    
    $TranscriptFile = Join-Path $LogRoot "Transcript-$ExecutionStartTime.log"
    Start-Transcript -Path $TranscriptFile;

    Write-Title 'STEP #1 - Logging into Azure'

    Write-Log -Message "Logging in to Azure"
    $loginOp = az login | ConvertFrom-Json
    if(!$loginOp) {
        throw "Encountered an Error while trying to Login."
    }
    Write-Log -Message "Successfully logged in to Azure."

    Write-Title 'STEP #2 - Choose Subscription'

    Write-Log -Message "Fetching List of Subscriptions in Users Account"

    $subscriptionList = ((az account list --all --output json) | ConvertFrom-Json);
    if(!$subscriptionList) {
        throw "Encountered an Error while trying to fetch Subscription List."
    }

    Write-Log -Message "List of Subscriptions:-`n$($subscriptionList | ConvertTo-Json -Compress)"

    $subscriptionCount = 0;
    foreach ($subscription in $subscriptionList) {
        $subscriptionCount += 1;
    }

    Write-Log -Message "Count of Subscriptions: $subscriptionCount"

    if ($subscriptionCount -eq 0) {
        throw "Please create atlease ONE Subscription in your Azure Account"
    }
    if ($subscriptionCount -eq 1) {
        $subscriptionName = $subscriptionList[0].name;
        Write-Log -Message "Defaulting to Subscription with Name: $subscriptionName"
    }
    else {
        $subscriptionListOutput = az account list --output table --all --query "[].{Name:name, Id:id IsDefault:isDefault}"
        $subscriptionListOutput;
        Write-Host ''
        Write-Host ''
        $subscriptionName = Read-Host 'Enter Subscription Name from Above List'
        Write-Log -Message "User Entered Subscription Name: $subscriptionName"

    }

    $isValidSubscriptionName = $false;
    foreach ($subscription in $subscriptionList) {
        if($subscription.name -ieq $subscriptionName) {
            $isValidSubscriptionName = $true;
            $userEmailAddress = $subscription.user.name;
        }
    }

    if(!$isValidSubscriptionName) {
        throw "Invalid Subscription Name Entered."
    }

    $setSubscriptionNameOp = (az account set --subscription $subscriptionName)
    #Intentionally not catching an exception here since the set subscription commands behavior (output) is different from others


    Write-Title("STEP #3 - Choose Location `n(Please refer to the Documentation / ReadMe on Github for the List of Supported Locations)");

    Write-Log -Message "Fetching List of Locations"
    $locationList = (az account list-locations) | ConvertFrom-Json;

    Write-Log -Message "List of Locations:-`n$($locationList | ConvertTo-Json -Compress)"
    az account list-locations --output table --query "[].{Name:name}"

    Write-Host ''
    Write-Host ''
    $locationName = Read-Host 'Enter Location From Above List for Resource Provisioning'
    Write-Log -Message "User Entered Location Name: $locationName"
    $isValidLocationName = $false;
    foreach ($location in $locationList) {
        if($location.name -ieq $locationName) {
            $isValidLocationName = $true;
        }
    }

    if(!$isValidLocationName) {
        throw "Invalid Location Name Entered."
    }


    Write-Title 'STEP #4 - Registering Azure Active Directory App'

    Write-Log -Message "Creating AAD App with Name: $appName"
    $appinfo=$(az ad app create --display-name $appName) | ConvertFrom-Json;
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

    Write-Title 'STEP #5 - Creating Resource Group'

    Write-Log -Message "Creating Resource Group with Name: $resourceGroupName at Location: $locationName"
    $resourceGroupCreationOp = az group create -l $locationName -n $resourceGroupName
    if(!$resourceGroupCreationOp) {
        throw "Encountered an Error while creating Resource Group with Name : " + $resourceGroupName + " at Location: " + $locationName + ". One Reason could be that the Resource Group with the same name but different location already exists in your Subscription. Delete the other Resource Group and run this script again."
    }

    Write-Host 'Resource Group Created Successfully'

    Write-Title 'STEP #6 - Creating Managed Identity'

    Write-Log -Message "Creating Managed identity inside ResourceGroup: $resourceGroupName and Identity Name: $identityName"
    $identityObj = (az identity create -g $resourceGroupName -n $identityName) | ConvertFrom-Json
    if(!$identityObj) {
        throw "Encountered an Error while creating managed identity inside ResourceGroup: " + $resourceGroupName + " and Identity Name: " + $identityName
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

    Write-Title 'STEP #8 - Creating Resources in Azure'

    $userObjectId = az ad signed-in-user show --query objectId
    #$userObjectId

    $templateFileName = "azuredeploy.json"
    $deploymentName = "Deployment-$ExecutionStartTime"
    Write-Log -Message "Deploying ARM Template to Azure inside ResourceGroup: $resourceGroupName with DeploymentName: $deploymentName, TemplateFile: $templateFileName, AppClientId: $($appinfo.appId), IdentifiedURI: $($appinfo.identifierUris)"
    $deploymentOutput = (az deployment group create --resource-group $resourceGroupName --name $deploymentName --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($identifierURI) identityName=$($identityName) userEmailAddress=$($userEmailAddress) userObjectId=$($userObjectId)) | ConvertFrom-Json;
    if(!$deploymentOutput) {
        throw "Encountered an Error while deploying to Azure"
    }

    #Updating the Config Entry EdnaLiteDevKey in the Function Config
    function Update-LtiFunctionAppSettings([string]$ResourceGroupName, [string]$FunctionAppName, [hashtable]$AppSettings) {
        Write-Log -Message "Updating App Settings for Function App [ $FunctionAppName ]: -"
        foreach ($it in $AppSettings.GetEnumerator()) {
            Write-Log -Message "`t[ $($it.Name) ] = [ $($it.Value) ]"
            az functionapp config appsettings set --resource-group $ResourceGroupName --name $FunctionAppName --settings "$($it.Name)=$($it.Value)"
        }
    }

    $KeyVaultLink=$(az keyvault key show --vault-name $deploymentOutput.properties.outputs.KeyVaultName.value --name EdnaLiteDevKey --query 'key.kid' -o json);
    $EdnaKeyString = @{ "EdnaKeyString"="$KeyVaultLink" }
    $ConnectUpdateOp = Update-LtiFunctionAppSettings $resourceGroupName $deploymentOutput.properties.outputs.ConnectFunctionName.value $EdnaKeyString
    $PlatformsUpdateOp = Update-LtiFunctionAppSettings $resourceGroupName $deploymentOutput.properties.outputs.PlatformsFunctionName.value $EdnaKeyString
    $UsersUpdateOp = Update-LtiFunctionAppSettings $resourceGroupName $deploymentOutput.properties.outputs.UsersFunctionName.value $EdnaKeyString

    Write-Host 'Resource Creation in Azure Completed Successfully'

    Write-Title 'STEP #9 - Updating AAD App'

    $AppRedirectUrl = $deploymentOutput.properties.outputs.webClientURL.value
    Write-Log -Message "Updating App with ID: $($appinfo.appId) to Redirect URL: $AppRedirectUrl and also enabling Implicit Flow"
    $appUpdateRedirectUrlOp = az ad app update --id $appinfo.appId --reply-urls $AppRedirectUrl --oauth2-allow-implicit-flow true
    #Intentionally not catching an exception here since the app update commands behavior (output) is different from others

    Write-Host 'App Update Completed Successfully'

    . .\Install-Backend.ps1
    Write-Title "STEP #10 - Installing the backend"

    $BackendParams = @{
        SourceRoot="../backend";
        ResourceGroupName=$resourceGroupName;
        LearnContentFunctionAppName=$deploymentOutput.properties.outputs.LearnContentFunctionName.value;
        LinksFunctionAppName=$deploymentOutput.properties.outputs.LinksFunctionName.value;
        AssignmentsFunctionAppName=$deploymentOutput.properties.outputs.AssignmentsFunctionName.value;
        ConnectFunctionAppName=$deploymentOutput.properties.outputs.ConnectFunctionName.value;
        PlatformsFunctionAppName=$deploymentOutput.properties.outputs.PlatformsFunctionName.value;
        UsersFunctionAppName=$deploymentOutput.properties.outputs.UsersFunctionName.value;
    }
    Install-Backend @BackendParams

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