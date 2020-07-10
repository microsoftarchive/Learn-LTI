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
Write-Host '=====================';
Write-Host 'Creating App Registration';
Write-Host '=====================';
Write-Host '';
Write-Host 'Runing Az Cli Commands';
Write-Host '-------------------';

Set-ExecutionPolicy Bypass -Scope Process


$resourceGroupName = "MSLearnLTI"
$identityName = "MSLearnLTI-Identity"
$roleName = "Contributor"
$templateFileName = "azuredeploy.json"

$appinfo=$(az ad app create --display-name MS-Learn-Lti-Tool-App) | ConvertFrom-Json;

az ad app update --id $appinfo.appId --identifier-uris "api://$($appinfo.appId)";

az group create -l westus -n $resourceGroupName

$identityObj = (az identity create -g $resourceGroupName -n $identityName) | ConvertFrom-Json

Write-Host $identityObj.principalId

Start-Sleep -s 30

az role assignment create --assignee-object-id $identityObj.principalId --assignee-principal-type ServicePrincipal --role $roleName

az deployment group create --resource-group $resourceGroupName --name MSLearnLTITooldeployment --template-file $templateFileName --parameters appRegistrationClientId=$($appinfo.appId) appRegistrationApiURI=$($appinfo.identifierUris)

Write-Host '=========App Registration Info============';
Write-Host '';
Write-Host "Your Client Id --> $($appinfo.appId)";
Write-Host '';
Write-Host "Your Api URI --> $($appinfo.identifierUris)";
Write-Host '';
Write-Host '==========================================';
