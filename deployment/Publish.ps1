# GLOBALS
# TODO: Update to parameterize
class Deployment {
    static [hashtable] $ResourceGroup = @{ "name"="MSLearnLTI" }
    static [hashtable] $FunctionApps = @{
        "Edna.AssignmentLearnContent"="learncontent-bblzecsor";
        "Edna.AssignmentLinks"="links-bblzecsor";
        "Edna.Assignments"="assignments-bblzecsor";
        "Edna.Connect"="connect-bblzecsor";
        "Edna.Platforms"="platform-bblzecsor";
        "Edna.Users"="users-bblzecsor"
    }
    static [hashtable] $StaticWebsite = @{ 
        "name"="learnclientbblzecsor";
        "webUrl"="https://learnclientbblzecsor.z6.web.core.windows.net/"
    }
}

function Write-Log {
    param(
        [Parameter(Mandatory)]
        [string]$Message
    ) 
    $now = (Get-Date).ToString();
    Write-Host "[$now] - $Message";
}

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

Push-Location "../backend"

Write-Title "Installing the backend"

# Go over all the [.csproj] files under the [Functions] folder and for each of them do the following:
# 1. Restore
# 2. Build
# 3. Publish
# 4. Zip the publish result
# 5. Deploy to the cloud
# 
# Best way would be to create a separate script for a single function deployment that receives parameters
$publishRoot = 'Artifacts'
if(Test-Path $publishRoot) {
    Write-Log "Deleting old Artifacts"
    Remove-Item -LiteralPath $publishRoot -Recurse -Force
}

$fnRegex = "Functions/**/*.csproj"
$functions = Get-ChildItem -Path $fnRegex -Recurse
foreach ($function in $functions) {
    $fnName = $function.Directory.Name
    $projectDir = $function.Directory

    $publishDir = Join-Path $publishRoot $fnName
    Write-Log "Building -- $publishDir"
    dotnet publish $projectDir --configuration RELEASE --output $publishDir --nologo --verbosity quiet

    $zipPath = Join-Path $publishRoot "$fnName.zip"
    Write-Log "Zipping Artifacts -- $zipPath"
    Compress-Archive -Path "$publishDir/*" -DestinationPath $zipPath

    $azFunctionName = [Deployment]::FunctionApps[$fnName]
    $resourceGroupName = [Deployment]::ResourceGroup["name"]
    Write-Log "Deploying to Azure -- $azFunctionName"
    az functionapp deployment source config-zip -g $resourceGroupName -n $azFunctionName --src $zipPath
}

Write-Log 'Deleting Artifacts'
Remove-Item -LiteralPath $publishRoot -Recurse -Force

Write-Title 'Backend Installation Completed'

Write-Title 'Installing the client'

Push-Location "../client"

Write-Log 'Running npm install';
npm ci

# TODO
# Fetch the needed values from different Azure resources and rewrite the [.env.production] file.

Write-Log 'Building React'
npm run build

Write-Log 'Deploying as a static WebApp';

$web = '$web'
$clientStorageAccount = [Deployment]::StaticWebsite["name"]
Write-Log 'Delete existing website content (Just in case of a redeploy)';
az storage blob delete-batch --account-name $clientStorageAccount --source $web

Write-Log 'Uploading build content to the static website storage container';
az storage blob upload-batch -s 'build' -d $web --account-name $clientStorageAccount 

Write-Title 'Client Installation Completed'

# Check if running Powershell ISE
if ($psISE) {
    Write-Host -NoNewLine 'Script is done';
} else {
    Write-Host -NoNewLine 'Press any key to continue...';
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}