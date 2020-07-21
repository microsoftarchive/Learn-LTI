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
    param (
        [Parameter(Mandatory)]
        [string]$dotEnvFile,
        [Parameter(Mandatory)]
        [string[]]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string[]]$FunctionAppNames,
        [Parameter(Mandatory)]
        [string]$AppId,
        [Parameter(Mandatory)]
        [string]$StaticWebsiteName
    )

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

    function Get-StaticWebsiteUrl {
        Write-Log "Getting Static Website Url -- $StaticWebsiteName"
        $account = az storage account show -n $StaticWebsiteName -g $ResourceGroupName | ConvertFrom-Json
        if (!$account) {
            throw 'Unable to get Static Website Account: $StaticWebsiteName for Resource Group: $ResourceGroupName'
        }
        return $account.primaryEndpoints.web;
    }

    function Get-ADAppScope  {
        Write-Log "Getting Default scope for App -- $AppId"
        return "api://$AppId/user_impersonation"
    }

    function Get-TenantId {
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

    function Get-ServiceUrl ([string]$fnName)  {
        Write-Log "Getting Service Url for Function -- $fnName"
        $serviceName = $FunctionAppNames | Where-Object { $_ -like "$fnName-*" }
        return "https://$serviceName.azurewebsites.net/api"
    }

    $dotEnv = @{
        [DotEnv]::REACT_APP_EDNA_AAD_CLIENT_ID="$AppId";
        [DotEnv]::REACT_APP_EDNA_MAIN_URL="$(Get-StaticWebsiteUrl)";
        [DotEnv]::REACT_APP_EDNA_DEFAULT_SCOPE="$(Get-ADAppScope)";
        [DotEnv]::REACT_APP_EDNA_TENANT_ID="$(Get-TenantId)";
        [DotEnv]::REACT_APP_EDNA_LEARN_CONTENT="$(Get-ServiceUrl "LearnContent")";
        [DotEnv]::REACT_APP_EDNA_LINKS_SERVICE_URL="$(Get-ServiceUrl "Links")";
        [DotEnv]::REACT_APP_EDNA_ASSIGNMENT_SERVICE_URL="$(Get-ServiceUrl "Assignments")";
        [DotEnv]::REACT_APP_EDNA_PLATFORM_SERVICE_URL="$(Get-ServiceUrl "Platforms")";
        [DotEnv]::REACT_APP_EDNA_USERS_SERVICE_URL="$(Get-ServiceUrl "Users")"
    }
    Export-DotEnv $dotEnv $dotEnvFile
}

function Install-Client {

    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$ClientRoot,
        [Parameter(Mandatory)]
        [string]$StaticWebsite
    )
    
    Push-Location $ClientRoot
        
    Write-Log 'Running npm install';
    npm ci

    Write-Log 'Building React'
    npm run build
    
    Write-Log "Deploying as a static WebApp -- $StaticWebsite";
    
    $web = '$web'
    $clientStorageAccount = $StaticWebsite
    Write-Log 'Delete existing website content (Just in case of a redeploy)';
    az storage blob delete-batch --account-name $clientStorageAccount --source $web
    
    Write-Log 'Uploading build content to the static website storage container';
    az storage blob upload-batch -s 'build' -d $web --account-name $clientStorageAccount 

    Pop-Location
}