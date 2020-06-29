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
Write-Host '';
Write-Host '';
Write-Host '';

# Will be used for accessing specific resources based on the naming convension used in the ARM template deployment
$resourceGroupName = Read-Host -Prompt 'Please provide the Resource Group name.'

Push-Location "../backend"

Write-Host '======================';
Write-Host 'Installing the backend';
Write-Host '======================';

# Go over all the [.csproj] files under the [Functions] folder and for each of them do the following:
# 1. Restore
# 2. Build
# 3. Publish
# 4. Zip the publish result
# 5. Deploy to the cloud
# 
# Best way would be to create a separate script for a single function deployment that receives parameters

Write-Host 'Restoring'
dotnet restore

Write-Host 'Building'
dotnet build --configuration RELEASE

Write-Host 'Publishing'
dotnet publish --configuration RELEASE --output Publish

Write-Host '==============================';
Write-Host 'Backend Installation Completed';
Write-Host '==============================';

Push-Location "../client"


Write-Host '=====================';
Write-Host 'Installing the client';
Write-Host '=====================';
Write-Host '';
Write-Host 'Running npm install';
Write-Host '-------------------';
npm i
Write-Host '';
Write-Host '';
Write-Host '';

# TODO
# Fetch the needed values from different Azure resources and rewrite the [.env.production] file.

Write-Host 'Building React';
Write-Host '--------------';
npm run-script build
Write-Host '';

Write-Host 'Deploying as a static WebApp';
Write-Host '----------------------------';
Write-Host '';
Write-Host 'Delete existing website content (Just in case of a redeploy)';
az storage blob delete-batch --account-name psednaclienttests --source '$web'

Write-Host 'Uploading build content to the static website storage container';
az storage blob upload-batch -s 'build' -d '$web' --account-name psednaclienttests

Write-Host '';

# TODO:
# Add the static website URL to the app registration redirect URL

Write-Host '=============================';
Write-Host 'Client Installation Completed';
Write-Host '=============================';

Write-Host '';
Write-Host '';
Write-Host '';

# Check if running Powershell ISE
if ($psISE)
{
    Write-Host -NoNewLine 'Script is done';
}
else
{
    Write-Host -NoNewLine 'Press any key to continue...';
    $x = $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}