$ErrorActionPreference = "Stop"

function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}

# A Create Active Directory application
$TenantName = Read-Host "Please enter your B2C tenant name"
$ADTenantName = Read-Host "Please enter your AD tenant name"

Write-Title "STEP 1: Create AD application"
az login --tenant "$ADTenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
$ADAppName = Read-Host "Please enter the name of the AD application"
$ADAppManifest = @"
	{
		"idToken": [
			{
				"name": "email",
				"essential": false,
			},
			{
				"name": "family_name",
				"essential": false,
			},
			{
				"name": "given_name",
				"essential": false,
			}
		],
		"accessToken": [],
		"saml2Token": []
	}
"@ | ConvertFrom-Json
ConvertTo-Json -InputObject $ADAppManifest | Out-File -FilePath "manifest.json"
$ADClientID = (az ad app create --display-name $ADAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://$TenantName.b2clogin.com/$TenantName.onmicrosoft.com/oauth2/authresp --optional-claims "@manifest.json" --query appId --output tsv --only-show-errors)

# Create client secret
Write-Host "Creating the client secret for $ADAppName"
$ADClientSecretName = Read-Host "Please enter the name of the client secret"
$ADClientSecretDuration = 1
$ADClientSecret = (az ad app credential reset --id $ADClientID --append --display-name $ADClientSecretName --years $ADClientSecretDuration --query password --output tsv --only-show-errors)
Write-Host "Please do protect the following client secret."
Write-Host "Client secret for $ADAppName`: $ADClientSecret"

# grant permissions for the AD app
Write-Host "Granting permissions to the AD application"
$profilePermission = "14dad69e-099b-42c9-810b-d002981feec1=Scope"
$emailPermission = "64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0=Scope"
az ad sp create --id $ADClientID --only-show-errors > $null
az ad app permission grant --id $ADClientID --api 00000003-0000-0000-c000-000000000000 --scope "email profile" --only-show-errors > $null
az ad app permission add --id $ADClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $emailPermission $profilePermission --only-show-errors

Remove-Item manifest.json

###################

# B login
Write-Title "STEP 2: Logging into the B2C Tenant" 
az login --tenant "$TenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null

###################

# C Create the web app
Write-Title "STEP 3: Creating the B2C Web application"
$B2cAppName = Read-Host "Please enter the name of the web application"
$WebClientID = (az ad app create --display-name $B2cAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://jwt.ms --enable-access-token-issuance true --enable-id-token-issuance true --query appId --output tsv --only-show-errors)

# create client secret
Write-Host "Creating the client secret for $B2cAppName"
$WebClientSecretName = Read-Host "Please enter the name of the client secret"
$WebClientSecretDuration = 1
$WebClientSecret = (az ad app credential reset --id $WebClientID --append --display-name $WebClientSecretName --years $WebClientSecretDuration --query password --output tsv --only-show-errors)
Write-Host "Please do protect the following client secret."
Write-Host "Client secret for $B2cAppName`: $WebClientSecret"

# set permissions for the web app
Write-Host "Granting permissions to the B2C Web application"
$openidPermission = "37f7f235-527c-4136-accd-4a02d197296e=Scope"
$offlineAccessPermission = "7427e0e9-2fba-42fe-b0c0-848c9e6a8182=Scope"
az ad sp create --id $WebClientID --only-show-errors > $null
az ad app permission grant --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors


###################

# D Create IdentityExperienceFramework app
Write-Title "STEP 4: Creating the Identity Experience Framework application"
$IEFAppName = "IdentityExperienceFramework"
$IEFClientID = (az ad app create --display-name $IEFAppName --sign-in-audience AzureADMyOrg --web-redirect-uris https://$TenantName.b2clogin.com/$TenantName.onmicrosoft.com --query appId --output tsv --only-show-errors)

# set permissions for the IEF app
Write-Host "Granting permissions to the IEF application"
az ad sp create --id $IEFClientID --only-show-errors > $null
az ad app permission grant --id $IEFClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $IEFClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors

# expose the user_impersonation API
Write-Host "Exposing the user_impersonation API"
az ad app update --id $IEFClientID --identifier-uris "https://playltib2c.onmicrosoft.com/$IEFClientID" --only-show-errors
$IEFAppInfo = (az ad app show --id $IEFClientID --only-show-errors | ConvertFrom-Json)
$IEFAppApiInfo = $IEFAppInfo.api
$IEFScopeGUID = [guid]::NewGuid()
$UserImpersonationScope = @"
	{
		"adminConsentDescription": "Allow the application to access IdentityExperienceFramework on behalf of the signed-in user.",
		"adminConsentDisplayName": "Access IdentityExperienceFramework",
		"id": "$IEFScopeGUID",
		"isEnabled": true,
		"type": "Admin",
		"userConsentDescription": null,
		"userConsentDisplayName": null,
		"value": "user_impersonation"
	}
"@ | ConvertFrom-Json
$IEFAppApiInfo.oauth2PermissionScopes += $UserImpersonationScope
ConvertTo-Json -InputObject $IEFAppApiInfo | Out-File -FilePath "userImpersonationScope.json"
az ad app update --id $IEFClientID --set api=@userImpersonationScope.json --only-show-errors

Remove-Item userImpersonationScope.json

###################

# E Create ProxyIEF app
Write-Title "STEP 5: Creating the Proxy Identity Experience Framework application"
$ProxyIEFAppName = "ProxyIdentityExperienceFramework"
$ProxyIEFClientID = (az ad app create --display-name $ProxyIEFAppName --sign-in-audience AzureADMyOrg --public-client-redirect-uris myapp://auth --is-fallback-public-client true --query appId --output tsv --only-show-errors)

Write-Host "Granting permissions to the Proxy IEF application"
az ad sp create --id $ProxyIEFClientID --only-show-errors > $null
az ad app permission grant --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
az ad app permission grant --id $ProxyIEFClientID --api $IEFClientID --scope "user_impersonation" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api $IEFClientID --api-permissions "$IEFScopeGUID=Scope" --only-show-errors