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


# Will be used for accessing specific resources based on the naming convension used in the ARM template deployment
$resourceGroupName = Read-Host -Prompt 'Please provide the Resource Group name.'

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

$AZ_FUNCTIONS = @{
    "Edna.AssignmentLearnContent"="edna-lti-ab-learn";
    "Edna.AssignmentLinks"="edna-lti-ab-links";
    "Edna.Assignments"="edna-lti-ab-assignment";
    "Edna.Connect"="edna-lti-ab-connect";
    "Edna.Platforms"="edna-lti-ab-platfomrs";
    "Edna.Users"="edna-lti-ab-users"
}

$fnRegex = "Functions/**/*.csproj"
$functions = Get-ChildItem -Path $fnRegex -Recurse
$publishRoot = 'Artifacts'
foreach ($function in $functions) {
    $fnName = $function.Directory.Name
    $projectDir = $function.Directory

    $publishDir = Join-Path $publishRoot $fnName
    Write-Log "Building -- $publishDir"
    dotnet publish $projectDir --configuration RELEASE --output $publishDir --nologo --verbosity quiet

    $zipPath = Join-Path $publishRoot "$fnName.zip"
    Write-Log "Zipping Artifacts -- $zipPath"
    Compress-Archive -Path "$publishDir/*" -DestinationPath $zipPath

    $azFunction = $AZ_FUNCTIONS[$fnName]
    Write-Log "Deploying to Azure -- $azFunction"
    az functionapp deployment config-zip -g $resourceGroupName -n $azFunction --src $zipPath
}

Write-Log 'Deleting Artifacts'
Remove-Item -LiteralPath $publishRoot -Recurse -Force

Write-Title 'Backend Installation Completed'

Write-Title 'Installing the client'

Push-Location "../client"

Write-Log 'Running npm install';
npm i

# TODO
# Fetch the needed values from different Azure resources and rewrite the [.env.production] file.

Write-Log 'Building React'
# npm run build

Write-Log 'Deploying as a static WebApp';

Write-Log 'Delete existing website content (Just in case of a redeploy)';
# az storage blob delete-batch --account-name psednaclienttests --source '$web'

Write-Host 'Uploading build content to the static website storage container';
# az storage blob upload-batch -s 'build' -d '$web' --account-name psednaclienttests

Write-Title 'Client Installation Completed'

# Check if running Powershell ISE
if ($psISE)
{
    Write-Host -NoNewLine 'Script is done';
}
else
{
    Write-Host -NoNewLine 'Press any key to continue...';
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}