Param ([Parameter(Mandatory=$true,HelpMessage="Please provide the Resource Group name.")][string]$resourceGroupName)


Push-Location "../backend/Functions"

Write-Host 'Restoring'
dotnet restore

Write-Host 'Building'
dotnet build --configuration RELEASE

Write-Host 'Publishing'
dotnet publish --configuration RELEASE --output Publish

Write-Host 'TAN DAN!'

Push-Location "../client"

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