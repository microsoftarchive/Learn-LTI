enum DotEnv {
    REACT_APP_EDNA_AAD_CLIENT_ID;
    REACT_APP_EDNA_MAIN_URL;
    REACT_APP_EDNA_DEFAULT_SCOPE;
    REACT_APP_EDNA_TENANT_ID;
    REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL;
    REACT_APP_EDNA_LINKS_SERVICE_URL;
    REACT_APP_EDNA_LEARN_CONTENT;
    REACT_APP_EDNA_USERS_SERVICE_URL;
    REACT_APP_EDNA_PLATFORM_SERVICE_URL
}

function Get-ADAppScope ([string]$AppId) {
    Write-Log "Getting Default scope for App -- $AppId"
    return "api://$AppId/user_impersonation"
}

function Get-TenantId ([string] $AppId) {
    # Assumes that the user is currently signed into correct subscription
    Write-Log "Getting Tenant Id for App -- $AppId"
    #$app = az ad sp show --id "$AppId" | ConvertFrom-Json
    $account = az account show | ConvertFrom-Json
    # if (!$app) {
    #     throw 'Unable to get App details for AD App Id: $AppId'
    # }
    return $account.tenantId
    #return $app.appOwnerTenantId
}

function Get-ServiceUrl ([string]$ServiceName)  {
    Write-Log "Getting Service Url for Function App -- $ServiceName"
    return "https://$ServiceName.azurewebsites.net/api"
}

function Export-DotEnv ([hashtable]$config, [string]$fileName) {
    # TODO: Test the config for completeness of values inside fileName
    Write-Log "Updating $fileName with new config"
    if (!(Test-Path $fileName)) {
        throw "Cannot export config, $fileName does not exist"
    }
    $tmpFile = "$fileName.tmp"
    if (Test-Path $tmpFile) {
        Remove-Item $tmpFile
    }
    foreach ($key in $config.keys) {
        Add-Content $tmpFile "$key='$($config[$key])'"
    }
    Move-Item -LiteralPath $tmpFile -Destination $fileName -Force
}

function Update-ClientConfig {

    [CmdletBinding(SupportsShouldProcess)]
    param (
        #[Parameter(Mandatory)]
        [string]$ConfigFilePath,
        #[Parameter(Mandatory)]
        [string]$ResourceGroupName,
        #[Parameter(Mandatory)]
        [string]$AppId,
        #[Parameter(Mandatory)]
        [string]$LearnContentFunctionAppName,
        #[Parameter(Mandatory)]
        [string]$LinksFunctionAppName,
        #[Parameter(Mandatory)]
        [string]$AssignmentsFunctionAppName,
        #[Parameter(Mandatory)]
        [string]$PlatformsFunctionAppName,
        #[Parameter(Mandatory)]
        [string]$UsersFunctionAppName,
        #[Parameter(Mandatory)]
        [string]$StaticWebsiteUrl
    )


    $Config = @{
        [DotEnv]::REACT_APP_EDNA_AAD_CLIENT_ID="$AppId";
        [DotEnv]::REACT_APP_EDNA_MAIN_URL="$StaticWebsiteUrl";
        [DotEnv]::REACT_APP_EDNA_DEFAULT_SCOPE="$(Get-ADAppScope $AppId)";
        [DotEnv]::REACT_APP_EDNA_TENANT_ID="$(Get-TenantId $AppId)";
        [DotEnv]::REACT_APP_EDNA_LEARN_CONTENT="$(Get-ServiceUrl $LearnContentFunctionAppName)";
        [DotEnv]::REACT_APP_EDNA_LINKS_SERVICE_URL="$(Get-ServiceUrl $LinksFunctionAppName)";
        [DotEnv]::REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL="$(Get-ServiceUrl $AssignmentsFunctionAppName)";
        [DotEnv]::REACT_APP_EDNA_PLATFORM_SERVICE_URL="$(Get-ServiceUrl $PlatformsFunctionAppName)";
        [DotEnv]::REACT_APP_EDNA_USERS_SERVICE_URL="$(Get-ServiceUrl $UsersFunctionAppName)"
    }
    Export-DotEnv $Config $ConfigFilePath
}

function Install-Client {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$SourceRoot,
        [Parameter(Mandatory)]
        [string]$StaticWebsiteStorageAccount
    )
    
    Push-Location $SourceRoot

    try {        
        Write-Log 'Running npm install'
        npm ci
    
        Write-Log 'Building Client App'
        npm run build
        
        Write-Log "Deploying as a static WebApp -- $StaticWebsiteStorageAccount"
        
        Write-Log 'Delete existing website content (Just in case of a redeploy)'
        az storage blob delete-batch --account-name $StaticWebsiteStorageAccount --source '$web'
        
        Write-Log 'Uploading build content to the static website storage container'
        az storage blob upload-batch -s 'build' -d '$web' --account-name $StaticWebsiteStorageAccount 
    }
    finally {
        Pop-Location
    }
}