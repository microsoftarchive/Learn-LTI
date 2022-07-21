$ErrorActionPreference = "Stop"

#region "Helper Functions"
#function for making clear and distinct titles
function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}

#function for making coloured outputs
function Write-Color($Color, [string]$Text) {
	Write-Host $Text -ForegroundColor $Color
}

#function for writing errors
function Write-Error([string]$Text) {
    Write-Host "`n`n=============================================================`n" -ForegroundColor "black" -BackgroundColor "DarkRed" -NoNewline
	Write-Host "Error!`n$Text" -ForegroundColor "black" -BackgroundColor "DarkRed" -NoNewline
    Write-Host "`n=============================================================" -ForegroundColor "black" -BackgroundColor "DarkRed"
}


#endregion

#region "AppInfo CSV setup"
$AppInfoCSVPath = ".\AppInfo.csv"
if (Test-Path $AppInfoCSVPath -PathType Leaf) {
    Clear-Content $AppInfoCSVPath
} else {
    New-Item $AppInfoCSVPath > $null
}
#endregeion

#region "STEP 1: Create Active Directory application"
$B2cTenantName = Read-Host "Please enter your B2C tenant name"
$ADTenantName = Read-Host "Please enter your AD tenant name"

Write-Title "STEP 1: Create AD application"
Write-Host "Please login to $ADTenantName via the pop-up window that has launched in your browser"
az login --tenant "$ADTenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
$MultiTenantAppName = Read-Host "Please give a name for the AD application to be created"
$ADAppManifest = "{
    `"idToken`": [
        {
            `"name`": `"email`",
            `"essential`": false
        },
        {
            `"name`": `"family_name`",
            `"essential`": false
        },
        {
            `"name`": `"given_name`",
            `"essential`": false
        }
    ],
    `"accessToken`": [],
    `"saml2Token`": []
}"
Out-File -FilePath "manifest.json" -InputObject $ADAppManifest
$MultiTenantAppID = (az ad app create --display-name $MultiTenantAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://$B2cTenantName.b2clogin.com/$B2cTenantName.onmicrosoft.com/oauth2/authresp --optional-claims "@manifest.json" --query appId --output tsv --only-show-errors)

"$MultiTenantAppID,$ADTenantName" | Out-File -FilePath $AppInfoCSVPath -Append

# Create client secret
Write-Host "Creating the client secret for $MultiTenantAppName"
$MultiTenantClientSecretName = Read-Host "Please give a name for the client secret to be created"
$MultiTenantClientSecretDuration = 1
$MultiTenantClientSecret = (az ad app credential reset --id $MultiTenantAppID --append --display-name $MultiTenantClientSecretName --years $MultiTenantClientSecretDuration --query password --output tsv --only-show-errors)
Write-Color "green" "Client ID for $MultiTenantAppName`: $MultiTenantAppID"
Write-Color "green" "Please take a moment to make a note of and protect the following client secret; as you will not be able to access it again."
Write-Color "green" "Client secret for $MultiTenantAppName`: $MultiTenantClientSecret"
Read-Host "Press enter when ready to continue after recording the client secret"

# grant permissions for the AD app
Write-Host "Granting permissions to the AD application"
$profilePermission = "14dad69e-099b-42c9-810b-d002981feec1=Scope"
$emailPermission = "64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0=Scope"
az ad sp create --id $MultiTenantAppID --only-show-errors 2>&1 > $null
az ad app permission grant --id $MultiTenantAppID --api 00000003-0000-0000-c000-000000000000 --scope "email profile" --only-show-errors > $null
az ad app permission add --id $MultiTenantAppID --api 00000003-0000-0000-c000-000000000000 --api-permissions $emailPermission $profilePermission --only-show-errors

Remove-Item manifest.json
#endregion


#region "STEP 2: login"
Write-Title "STEP 2: Logging into the B2C Tenant" 
Write-Host "Please login to $B2cTenantName via the pop-up window that has launched in your browser"
az login --tenant "$B2cTenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
#endregion


#region "STEP 3: Create the web app"
Write-Title "STEP 3: Creating the B2C Web application"
$B2cAppName = Read-Host "Please give a name for the web application to be created"
$WebClientID = (az ad app create --display-name $B2cAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://jwt.ms --enable-access-token-issuance true --enable-id-token-issuance true --query appId --output tsv --only-show-errors)

"$WebClientID,$B2cTenantName" | Out-File -FilePath $AppInfoCSVPath -Append

# create client secret
Write-Host "Creating the client secret for $B2cAppName"
$WebClientSecretName = Read-Host "Please give a name for the client secret to be created"
$WebClientSecretDuration = 1
$WebClientSecret = (az ad app credential reset --id $WebClientID --append --display-name $WebClientSecretName --years $WebClientSecretDuration --query password --output tsv --only-show-errors)
Write-Color "green" "Client ID for $B2cAppName`: $WebClientID"
Write-Color "green" "Please take a moment to make a note of and protect the following client secret; as you will not be able to access it again."
Write-Color "green" "Client secret for $B2cAppName`: $WebClientSecret"
Read-Host "Press enter when ready to continue after recording the client secret"

# set permissions for the web app
Write-Host "Granting permissions to the B2C Web application"
$openidPermission = "37f7f235-527c-4136-accd-4a02d197296e=Scope"
$offlineAccessPermission = "7427e0e9-2fba-42fe-b0c0-848c9e6a8182=Scope"
az ad sp create --id $WebClientID --only-show-errors 2>&1 > $null
az ad app permission grant --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
#endregion


#region "STEP 4: Create IdentityExperienceFramework app"
Write-Title "STEP 4: Creating the Identity Experience Framework application"
$IEFAppName = "IdentityExperienceFramework"
$IEFClientID = (az ad app create --display-name $IEFAppName --sign-in-audience AzureADMyOrg --web-redirect-uris https://$B2cTenantName.b2clogin.com/$B2cTenantName.onmicrosoft.com --query appId --output tsv --only-show-errors)

"$IEFClientID,$B2cTenantName" | Out-File -FilePath $AppInfoCSVPath -Append

# set permissions for the IEF app
Write-Host "Granting permissions to the IEF application"
az ad sp create --id $IEFClientID --only-show-errors 2>&1 > $null
az ad app permission grant --id $IEFClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $IEFClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors

# expose the user_impersonation API
Write-Host "Exposing the user_impersonation API"
az ad app update --id $IEFClientID --identifier-uris "https://$B2cTenantName.onmicrosoft.com/$IEFClientID" --only-show-errors
$IEFAppInfo = (az ad app show --id $IEFClientID --only-show-errors | ConvertFrom-Json)
$IEFAppApiInfo = $IEFAppInfo.api
$IEFScopeGUID = [guid]::NewGuid()
$UserImpersonationScope = "{
		`"adminConsentDescription`": `"Allow the application to access IdentityExperienceFramework on behalf of the signed-in user.`",
		`"adminConsentDisplayName`": `"Access IdentityExperienceFramework`",
		`"id`": `"$IEFScopeGUID`",
		`"isEnabled`": true,
		`"type`": `"Admin`",
		`"userConsentDescription`": null,
		`"userConsentDisplayName`": null,
		`"value`": `"user_impersonation`"
}" | ConvertFrom-Json
$IEFAppApiInfo.oauth2PermissionScopes += $UserImpersonationScope
ConvertTo-Json -InputObject $IEFAppApiInfo | Out-File -FilePath "userImpersonationScope.json"
az ad app update --id $IEFClientID --set api=@userImpersonationScope.json --only-show-errors

# granting user_impersonation to the web app
az ad app permission grant --id $WebClientID --api $IEFClientID --scope "user_impersonation" --only-show-errors > $null
az ad app permission add --id $WebClientID --api $IEFClientID --api-permissions "$IEFScopeGUID=Scope" --only-show-errors

Remove-Item userImpersonationScope.json
#endregion


#region "STEP 5: Create ProxyIEF app"
Write-Title "STEP 5: Creating the Proxy Identity Experience Framework application"
$ProxyIEFAppName = "ProxyIdentityExperienceFramework"
$ProxyIEFClientID = (az ad app create --display-name $ProxyIEFAppName --sign-in-audience AzureADMyOrg --public-client-redirect-uris myapp://auth --is-fallback-public-client true --query appId --output tsv --only-show-errors)

"$ProxyIEFClientID,$B2cTenantName" | Out-File -FilePath $AppInfoCSVPath -Append

Write-Host "Granting permissions to the Proxy IEF application"
az ad sp create --id $ProxyIEFClientID --only-show-errors 2>&1 > $null
az ad app permission grant --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
az ad app permission grant --id $ProxyIEFClientID --api $IEFClientID --scope "user_impersonation" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api $IEFClientID --api-permissions "$IEFScopeGUID=Scope" --only-show-errors
#endregion

#region "STEP 6: Create Permission Management app"
Write-Title "STEP 6: Creating Permission Management application"
$PermissionAppName = Read-Host "Please give a name for the permission management application to be created"
$PermissionClientID = (az ad app create --display-name $PermissionAppName --sign-in-audience AzureADMyOrg --query appId --output tsv --only-show-errors)

"$PermissionClientID,$B2cTenantName" | Out-File -FilePath $AppInfoCSVPath -Append

# create client secret
Write-Host "Creating the client secret for $PermissionAppName"
$PermissionClientSecretName = Read-Host "Please give a name for the client secret to be created"
$PermissionClientSecretDuration = 1
$PermissionClientSecret = (az ad app credential reset --id $PermissionClientID --append --display-name $PermissionClientSecretName --years $PermissionClientSecretDuration --query password --output tsv --only-show-errors)
Write-Color "green" "Client ID for $PermissionAppName`: $PermissionClientID"
Write-Color "green" "Please take a moment to make a note of and protect the following client secret; as you will not be able to access it again."
Write-Color "green" "Client secret for $PermissionAppName`: $PermissionClientSecret"
Read-Host "Press enter when ready to continue after recording the client secret"

# set permissions for the web app
Write-Host "Granting permissions to the B2C Permission Management application"
$keysetRWPermission = "4a771c9a-1cf2-4609-b88e-3d3e02d539cd=Role"
$policyRWPermission = "79a677f7-b79d-40d0-a36a-3e6f8688dd7a=Role"
az ad sp create --id $PermissionClientID --only-show-errors 2>&1 > $null
az ad app permission grant --id $PermissionClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $PermissionClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
az ad app permission add --id $PermissionClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $keysetRWPermission $policyRWPermission --only-show-errors
az ad app permission admin-consent --id $PermissionClientID --only-show-errors
#endregion

#region "STEP 7: restrict access via whitelisting tenants"
# https://docs.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-azure-ad-multi-tenant?pivots=b2c-custom-policy#restrict-access
Write-Title "STEP 7: Creating a whitelist for the tenants we wish to give access to"
Write-Host "Important - if no tenants are whitelisted; nobody will be able to access the AD"
$continue = "y"
$whitelist = @()
while($continue -eq "y"){
    $wlTenantID = Read-Host "Please enter the tenant ID field of the tenant you wish to add to the whitelist: "

    try{
        #region "HTTP request to get the issuer claim we want to add to the whitelist"
        $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
        $headers.Add("Cookie", "esctx=AQABAAAAAAD--DLA3VO7QrddgJg7Wevrz5AJFK2BuCxYc25okcgEMIhli-M9GRnC77gX9U2agXqRChe5Tk3qNfEPzYWBnDAUp-o9RWFY5KNcFx-vXSzS0awJmoC7qDfdimSHwN_cVTAk3AVnFnGSxQfcY9xfjJxnZI_bqBXjO6MUJ0rjdw14dd7jnRNLmUGqljuVubDJWG8gAA; fpc=AkuS-X1BCTpNr-MiUS-IqaM; stsservicecookie=estsfd; x-ms-gateway-slice=estsfd")

        $response = Invoke-RestMethod "https://login.microsoftonline.com/$wlTenantID/v2.0/.well-known/openid-configuration" -Method 'GET' -Headers $headers
        $issuer = $response.issuer
        #endregion

        $whitelist += $issuer #adding the issuer for this tenant to the whitelist
    }
    catch{
        Write-Host ""
        Write-Error ("HTTP request to get the issuer claim failed, please ensure the tenant ID is correct`n`n"+$Error[0])
        Write-Host ""
    }
    
    $continue = Read-Host "Would you like to add another tenant? (y/n)"
}

$whitelistString = $whitelist -join ","
#endregion


#region "STEP 8: (Optional) linking facebook apps"
Write-Title "STEP 8: (Optional) linking facebook app"
$HasFaceBookApp = ""
while($HasFaceBookApp -ne "y" -and $HasFaceBookApp -ne "n"){
    $HasFaceBookApp = Read-Host "Do you have a facebook application set up that you'd like to link? (y/n)"
}
$FacebookId = "00000000-0000-0000-0000-000000000000" #default to meaningless placeholder value if app isn't set up
$FacebookSecret = "00000000-0000-0000-0000-000000000000" #default to meaningless placeholder value if app isn't set up
if($HasFaceBookApp -eq "y"){
	$FacebookId = Read-Host "What is the application ID of the Facebook application you created?"
    $FacebookSecret = Read-Host "What is the secret value of the Facebook application you created?"
}
#endregion


#region "STEP 9: looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates"
Write-Title "STEP 9: Creating template custom policies"
Get-ChildItem ".\CustomPolicyTemplates\" | Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path (".\CustomPolicy\"+$_.Name)
}
#endregion


#region "Step 10: looping through each CustomPolicy and replacing their placeholder values to generate the final custom policies"
Write-Title "Step 10: Replacing values in template custom policies to generate finalised custom policies"
Get-ChildItem ".\CustomPolicy\" | Foreach-Object {
    #ignore the gitkeep
    if($_.Name -ne ".gitkeep"){
        ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

        ((Get-Content -path $_.FullName -Raw) -replace '<<ProxyIdentityExperienceFrameworkAppId>>', $ProxyIEFClientID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
        
        ((Get-Content -path $_.FullName -Raw) -replace '<<IdentityExperienceFrameworkAppId>>', $IEFClientID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
        
        ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookId>>', $FacebookId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

        ((Get-Content -path $_.FullName -Raw) -replace '<<MultiTenantAppID>>', $MultitenantAppID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
        
        ((Get-Content -path $_.FullName -Raw) -replace '<<WhiteListedTenants>>', $whitelistString) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    }

}
#endregion

#region "STEP 11: Add signing and encryption keys and AADAppSecret for the IEF applications"

#region "Function for calculating the not before and expiry datetimes for the keys"
function getNbfExp($num_months){
	$start_date = Get-Date -Date "1970-01-01 00:00:00Z"
	$date = Get-Date
    $date = $date.ToUniversalTime()
	$nbf = [math]::floor(($date - $start_date).TotalSeconds)
	$exp = [math]::floor((($date - $start_date).TotalSeconds) + $num_months * 60 * 60 * 24 * 30)
	return $nbf, $exp
}
#endregion

Write-Title "Step 11: Adding signing and encryption keys and AADAppSecret for the IEF applications"

$num_months = 0 
while($num_months -le 0){
	[uint16] $num_months = Read-Host "How many months do you want the keys to be valid for? (must be greater than 0)"
}


Write-Host "Getting the token to be used in the HTML Requests and the list of existing keysets to check for conflicts when creating new ones"
$response = ""
$keysets = ""
while(1){
    try{
        #region "Getting the token to be used in the HTML REQUESTS"
        # relevant docs: https://docs.microsoft.com/en-us/graph/auth-v2-service#4-get-an-access-token

        $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
        $headers.Add("Content-Type", "application/x-www-form-urlencoded")

        $body = "client_id=$PermissionClientID&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=$PermissionClientSecret&grant_type=client_credentials"

        $response = Invoke-RestMethod "https://login.microsoftonline.com/$B2cTenantName.onmicrosoft.com/oauth2/v2.0/token" -Method 'POST' -Headers $headers -Body $body
        $access_token = $response.access_token
        $access_token = "Bearer " + $access_token
        #endregion

        #region "Getting the list of all custom policies in the tenant; to check if each keyset already exists prior to creating it"
        $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
        $headers.Add("Authorization", $access_token)
        $response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'GET' -Headers $headers
        $keysets = $response.value
        $keysets = $keysets.id
        #endregion
        break
    }
    catch{
        Write-Host ""
        Write-Error $Error[0]
        Write-Host ""
        Write-Color "Red" "Error may be due to admin-consent having not yet been granted; please switch your directory to the b2c tenant ($B2cTenantName) in the Azure portal then copy and paste the yellow link into your browser to manually grant admin-consent then press enter."
        $PMA_Page = "https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/$PermissionClientID/isMSAApp~/false"
        Write-Color "Yellow" "$PMA_Page"
        Write-Host "Please check the markdown https://github.com/UCL-MSc-Learn-LTI/Learn-LTI/deployment/B2C_Docs/B2C_Deployment.md if you require assistance on how to do this."
        Read-Host "Press enter after manually granting the admin consent permission"
    }
}    

#region "Step 11.A: Create the signing key"
Write-Title "Step 11.A: Creating the Signing Key"

if($keysets -contains "B2C_1A_TokenSigningKeyContainer"){
    Read-Host "B2C_1A_TokenSigningKeyContainer already exists, so cannot upload it again. If this is not expected, please terminate this script and run B2CCleanup.ps1 first."
}
else{
    #region "Creating the signing keyset (container)"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-keysets?view=graph-rest-beta&tabs=http
    Write-Host "`nCreating the signing keyset (container)`n"
    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{`"id`":`"B2C_1A_TokenSigningKeyContainer`"}"

    $response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'POST' -Headers $headers -Body $body
    $response | ConvertTo-Json
    $signing_container_id = $response.id

    Write-Host "`nSuccessfully created the key signing container: "+$signing_container_id+"`n"
    #endregion

    #region "Generating the signing key"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframeworkkeyset-generatekey?view=graph-rest-beta&tabs=http
    #calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
    Write-Host "`nGenerating the signing key and uploading to the keyset`n"
    $arr = getNbfExp($num_months)
    $nbf = $arr[0]
    $exp = $arr[1]


    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{
    `n  `"use`": `"sig`",
    `n  `"kty`": `"RSA`",
    `n  `"nbf`": "+$nbf+",
    `n  `"exp`": "+$exp+",
    `n}"

    $response = Invoke-RestMethod ('https://graph.microsoft.com/beta/trustFramework/keySets/'+$signing_container_id+'/generateKey') -Method 'POST' -Headers $headers -Body $body

    Write-Host "successfully generated and uploaded the signing key"
    #endregion
}
#endregion


#region "Step 11.B: Create the encryption key"
Write-Title "Step 11.B: Creating the Signing Key"

if($keysets -contains "B2C_1A_TokenSigningKeyContainer"){
    Read-Host "B2C_1A_TokenSigningKeyContainer already exists, so cannot upload it again. If this is not expected, please terminate this script and run B2CCleanup.ps1 first."
}
else{
#region "Creating the encryption keyset (container)"
#reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-keysets?view=graph-rest-beta&tabs=http
Write-Host "`nCreating the signing keyset (container)`n"
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$headers.Add("Content-Type", "application/json")

$body = "{`"id`":`"B2C_1A_TokenEncryptionKeyContainer`"}"

$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'POST' -Headers $headers -Body $body
$encryption_container_id = $response.id

Write-Host "Successfully created the key encryption container: $encryption_container_id"
#endregion


#region "Generating the encryption key"
#reference: https://docs.microsoft.com/en-us/graph/api/trustframeworkkeyset-generatekey?view=graph-rest-beta&tabs=http
#calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
Write-Host "`nGenerating the encryption key and uploading to the keyset`n"
$arr = getNbfExp($num_months)
$nbf = $arr[0]
$exp = $arr[1]

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$headers.Add("Content-Type", "application/json")

$body = "{
`n  `"use`": `"enc`",
`n  `"kty`": `"RSA`",
`n  `"nbf`": "+$nbf+",
`n  `"exp`": "+$exp+",
`n}"

$response = Invoke-RestMethod ("https://graph.microsoft.com/beta/trustFramework/keySets/$encryption_container_id/generateKey") -Method 'POST' -Headers $headers -Body $body

Write-Host "Successfully generated and uploaded the encryption key"
}
#endregion
#endregion


#region "Step 11.C: Create the AADSecret keyset"
Write-Title "Step 11.C: Creating the AADAppSecret Key"

if($keysets -contains "B2C_1A_AADAppSecret"){
    Read-Host "B2C_1A_AADAppSecret already exists, so cannot upload it again. If this is not expected, please terminate this script and run B2CCleanup.ps1 first."
}
else{
    #region "Creating the AADAppSecret keyset (container)"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-keysets?view=graph-rest-beta&tabs=http
    Write-Host "`nCreating the AADAppSecret keyset (container)`n"
    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{`"id`":`"B2C_1A_AADAppSecret`"}"

    $response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'POST' -Headers $headers -Body $body
    $AADAppSecret_container_id = $response.id

    Write-Host "Successfully created the key AADAppSecret container: $AADAppSecret_container_id"
    #endregion

    #region "Uploading the AADAppSecret key"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframeworkkeyset-uploadsecret?view=graph-rest-beta&tabs=https
    #calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
    Write-Host "`nGenerating the AADAppSecret key and uploading to the keyset`n"
    $arr = getNbfExp($num_months)
    $nbf = $arr[0]
    $exp = $arr[1]

    #uploading the AADAppSecret key
    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{
    `n  `"use`": `"sig`",
    `n  `"k`": `""+$MultiTenantClientSecret+"`",
    `n  `"nbf`": "+$nbf+",
    `n  `"exp`": "+$exp+"
    `n}"

    $response = Invoke-RestMethod "https://graph.microsoft.com/beta/trustFramework/keySets/$AADAppSecret_container_id/uploadSecret" -Method 'POST' -Headers $headers -Body $body

    Write-Host "Successfully uploaded the AADAppSecret key"
}
#endregion

#endregion 

#region "Step 11.D: Create the Facebook keyset"
#TODO - eventually only run this step if we are using Facebook (and then use different contract templates for linking facebook vs without)
Write-Title "Step 11.D: Creating the Facebook Key"

if($keysets -contains "B2C_1A_FacebookSecret"){
    Read-Host "B2C_1A_FacebookSecret already exists, so cannot upload it again. If this is not expected, please terminate this script and run B2CCleanup.ps1 first."
}
else{
    #region "Creating the B2C_1A_FacebookSecret keyset (container)"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-keysets?view=graph-rest-beta&tabs=http
    Write-Host "`nCreating the FacebookSecret keyset (container)`n"
    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{`"id`":`"B2C_1A_FacebookSecret`"}"

    $response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'POST' -Headers $headers -Body $body
    $FacebookSecret_container_id = $response.id

    Write-Host "Successfully created the key FacebookSecret container: $FacebookSecret_container_id"
    #endregion

    #region "Uploading the AADAppSecret key"
    #reference: https://docs.microsoft.com/en-us/graph/api/trustframeworkkeyset-uploadsecret?view=graph-rest-beta&tabs=https
    #calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
    Write-Host "`nGenerating the FacebookSecret key and uploading to the keyset`n"
    $arr = getNbfExp($num_months)
    $nbf = $arr[0]
    $exp = $arr[1]

    #uploading the FacebookSecret key
    $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
    $headers.Add("Authorization", $access_token)
    $headers.Add("Content-Type", "application/json")

    $body = "{
    `n  `"use`": `"sig`",
    `n  `"k`": `""+$FacebookSecret+"`",
    `n  `"nbf`": "+$nbf+",
    `n  `"exp`": "+$exp+"
    `n}"

    $response = Invoke-RestMethod "https://graph.microsoft.com/beta/trustFramework/keySets/$FacebookSecret_container_id/uploadSecret" -Method 'POST' -Headers $headers -Body $body

    Write-Host "Successfully uploaded the FacebookSecret key"
}
#endregion

#endregion
#endregion

#region "STEP 12: uploading the custom policies to the b2c tenant"

#region "Function for updating existing custom policy or uploading new custom policies"
function CustomPolicyUpdateOrUpload($customPolicyName, $customPolicies, $access_token) {
    process{
        if($customPolicies -contains $customPolicyName){
            $updateCustomPolicy = ""
            while($UpdateCustomPolicy -ne "y" -and $UpdateCustomPolicy -ne "n"){
                $UpdateCustomPolicy = Read-Host "$customPolicyName already exists, would you like to update it? ('y' recommended OR 'n') "
            }
            
            if($UpdateCustomPolicy -eq "y"){
                #reference: https://docs.microsoft.com/en-us/graph/api/trustframework-put-trustframeworkpolicy?view=graph-rest-beta
                $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
                $headers.Add("Content-Type", "application/xml")
                $headers.Add("Authorization", $access_token)
                [string] $body = Get-Content "./CustomPolicy/$customPolicyName.xml"
                $response = Invoke-RestMethod ('https://graph.microsoft.com/beta/trustFramework/policies/'+$customPolicyName+'/$value') -Method 'PUT' -Headers $headers -Body $body
                $response | ConvertTo-Json
            }
        }
        else{
            #reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-trustframeworkpolicy?view=graph-rest-beta
            Write-Host "$customPolicyName does not exist, so uploading it to a new custom policy on Azure"
            $headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
            $headers.Add("Authorization", $access_token)
            $headers.Add("Content-Type", "application/xml")
            [string] $body = Get-Content "./CustomPolicy/$customPolicyName.xml"
            $response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body
        }
    }
}
#endregion

Write-Title "STEP 12: Uploading the custom policies to the b2c tenant"

#getting list of all users in the tenant
Write-Host "Getting the list of all custom policies in the tenant"
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'GET' -Headers $headers
$customPolicies = $response.value
$customPolicies = $customPolicies.id


Write-Host "Uploading/updating each of the custom policies"

# Order matters in the uploads - do not modify the order
CustomPolicyUpdateOrUpload "B2C_1A_TrustFrameworkBase" $customPolicies $access_token
CustomPolicyUpdateOrUpload "B2C_1A_TrustFrameworkLocalization" $customPolicies $access_token
CustomPolicyUpdateOrUpload "B2C_1A_TrustFrameworkExtensions" $customPolicies $access_token
CustomPolicyUpdateOrUpload "B2C_1A_signup_signin" $customPolicies $access_token
CustomPolicyUpdateOrUpload "B2C_1A_ProfileEdit" $customPolicies $access_token
CustomPolicyUpdateOrUpload "B2C_1A_PasswordReset" $customPolicies $access_token
#endregion

#returning values required by the Deploy.ps1 script
return $WebClientID, $WebClientSecret, $B2cTenantName