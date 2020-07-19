# GLOBALS
# TODO: Update to parameterize
class Deployment {
    static [hashtable] $ResourceGroup = @{ "name"="MSLearnLTI" }
    static [hashtable] $AppRegistration = @{
        "ClientId"="29ef9874-9b8d-44bf-a237-2fe4672b1359";
        "Uri"="api://29ef9874-9b8d-44bf-a237-2fe4672b1359"
    }
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

function Install-Backend {
    # Go over all the [.csproj] files under the [Functions] folder and for each of them do the following:
    # 1. Restore
    # 2. Build
    # 3. Publish
    # 4. Zip the publish result
    # 5. Deploy to the cloud
    # 
    # Best way would be to create a separate script for a single function deployment that receives parameters
    
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$BackendRoot
    )

    Push-Location $BackendRoot
    Write-Title "Installing the backend"
    
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
    Pop-Location
}

function Install-Client {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ClientRoot
    )
    
    Push-Location $ClientRoot
    Write-Title 'Installing the client'
        
    Write-Log 'Running npm install';
    npm ci

    function Update-ClientConfig {
        param (
            [Parameter(Mandatory)]
            [string]$dotEnvFile
        )

        enum DotEnv {
            AAD_CLIENT_ID;
            MAIN_URL;
            DEFAULT_SCOPE;
            TENANT_ID;
            ASSIGNMENT_SERVICE_URL;
            LINKS_SERVICE_URL;
            LEARN_CONTENT;
            USERS_SERVICE_URL;
            PLATFORM_SERVICE_URL
        }
    
        function Get-ServiceUrl ([string]$azFunc)  {
            $serviceName = [Deployment]::FunctionApps[$azFunc]
            return "https://$serviceName.azurewebsites.net/api"
        }

        function Get-ADAppScope {
            $adAppUri = [Deployment]::AppRegistration["Uri"] 
            return "$adAppUri/user_impersonation"
        }
        
        function Get-TenantId {
            # Assumes that the user is currently signed into correct subscription
            $account = az account show | ConvertFrom-Json
            if (!$account) {
                throw 'Unable to get tenantId details for the user'
            }
            return $account.tenantId
        }
    
        function Export-DotEnv ([hashtable]$config, [string]$fileName) {
            # TODO: Test the config for completeness of values inside fileName
            $tmpFile = "$fileName.tmp"
            if (Test-Path $tmpFile) {
                Remove-Item $tmpFile
            }
            foreach ($key in $config.keys) {
                Add-Content $tmpFile "REACT_APP_EDNA_$key='$($config[$key])'"
            }
            Move-Item -LiteralPath $tmpFile -Destination $fileName -Force
        }
        
        $dotEnv = @{        
            [DotEnv]::AAD_CLIENT_ID="$([Deployment]::AppRegistration["ClientId"])";
            [DotEnv]::MAIN_URL="$([Deployment]::StaticWebsite["WebUrl"])";
            [DotEnv]::DEFAULT_SCOPE="$(Get-ADAppScope)";
            [DotEnv]::TENANT_ID="$(Get-TenantId)";
            [DotEnv]::LEARN_CONTENT="$(Get-ServiceUrl "Edna.AssignmentLearnContent")";
            [DotEnv]::LINKS_SERVICE_URL="$(Get-ServiceUrl "Edna.AssignmentLinks")";
            [DotEnv]::ASSIGNMENT_SERVICE_URL="$(Get-ServiceUrl "Edna.Assignments")";
            [DotEnv]::PLATFORM_SERVICE_URL="$(Get-ServiceUrl "Edna.Platforms")";
            [DotEnv]::USERS_SERVICE_URL="$(Get-ServiceUrl "Edna.Users")"
        }
        Export-DotEnv $dotEnv $dotEnvFile
    }

    Write-Log 'Updating Config'
    Update-ClientConfig '.env.production'

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
}

Install-Backend "../backend"
Install-Client "../client"

# Check if running Powershell ISE
if ($psISE) {
    Write-Host -NoNewLine 'Script is done';
} else {
    Write-Host -NoNewLine 'Press any key to continue...';
    $host.ui.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}