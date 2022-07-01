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
	process{Write-Host $Text -ForegroundColor $Color}
}

function getNbfExp($num_months){
	$start_date = Get-Date -Date "1970-01-01 00:00:00Z"
	$date = Get-Date
	$nbf = [math]::floor(($date - $start_date).TotalSeconds)
	$exp = [math]::floor((($date - $start_date).TotalSeconds) + $num_months * 60 * 60 * 24 * 30)
	return $nbf, $exp
}
#endregion

#region "Importing Modules"
# Write-Title "Importing Modules"
# Write-Host "Importing Module AzureADPreview" # REQUIRES THE PREVIEW VERSION
# Import-Module AzureADPreview
# Write-Host "Importing Module Microsoft.Graph.Identity.SignIns"
# Import-Module Microsoft.Graph.Identity.SignIns
#endregion

#region "STEP 1: Create Active Directory application"
$B2cTenantName = Read-Host "Please enter your B2C tenant name"
$ADTenantName = Read-Host "Please enter your AD tenant name"

Write-Title "STEP 1: Create AD application"
Write-Host "Please login via the pop-up window that has launched in your browser"
az login --tenant "$ADTenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
$ADAppName = Read-Host "Please give a name for the AD application to be created"
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
$MultiTenantAppID = (az ad app create --display-name $ADAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://$B2cTenantName.b2clogin.com/$B2cTenantName.onmicrosoft.com/oauth2/authresp --optional-claims "@manifest.json" --query appId --output tsv --only-show-errors)

# Create client secret
Write-Host "Creating the client secret for $ADAppName"
$ADClientSecretName = Read-Host "Please give a name for the client secret to be created"
$ADClientSecretDuration = 1
$ADClientSecret = (az ad app credential reset --id $MultiTenantAppID --append --display-name $ADClientSecretName --years $ADClientSecretDuration --query password --output tsv --only-show-errors)
Write-Color "green" "Please take a moment to make a note of and protect the following client secret; as you will not be able to access it again."
Write-Color "green" "Client secret for $ADAppName`: $ADClientSecret"
Read-Host "Press enter when ready to continue after recording the client secret"

# grant permissions for the AD app
Write-Host "Granting permissions to the AD application"
$profilePermission = "14dad69e-099b-42c9-810b-d002981feec1=Scope"
$emailPermission = "64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0=Scope"
az ad sp create --id $MultiTenantAppID --only-show-errors > $null
az ad app permission grant --id $MultiTenantAppID --api 00000003-0000-0000-c000-000000000000 --scope "email profile" --only-show-errors > $null
az ad app permission add --id $MultiTenantAppID --api 00000003-0000-0000-c000-000000000000 --api-permissions $emailPermission $profilePermission --only-show-errors

Remove-Item manifest.json
#endregion


#region "STEP 2: login"
Write-Title "STEP 2: Logging into the B2C Tenant" 
Write-Host "Please login via the pop-up window that has launched in your browser"
az login --tenant "$B2cTenantName.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
#endregion


#region "STEP 3: Create the web app"
Write-Title "STEP 3: Creating the B2C Web application"
$B2cAppName = Read-Host "Please give a name for the web application to be created"
$WebClientID = (az ad app create --display-name $B2cAppName --sign-in-audience AzureADandPersonalMicrosoftAccount --web-redirect-uris https://jwt.ms --enable-access-token-issuance true --enable-id-token-issuance true --query appId --output tsv --only-show-errors)

# create client secret
Write-Host "Creating the client secret for $B2cAppName"
$WebClientSecretName = Read-Host "Please give a the name for the client secret to be created"
$WebClientSecretDuration = 1
$WebClientSecret = (az ad app credential reset --id $WebClientID --append --display-name $WebClientSecretName --years $WebClientSecretDuration --query password --output tsv --only-show-errors)
Write-Color "green" "Please take a moment to make a note of and protect the following client secret; as you will not be able to access it again."
Write-Color "green" "Client secret for $B2cAppName`: $WebClientSecret"
Read-Host "Press enter when ready to continue after recording the client secret"

# set permissions for the web app
Write-Host "Granting permissions to the B2C Web application"
$openidPermission = "37f7f235-527c-4136-accd-4a02d197296e=Scope"
$offlineAccessPermission = "7427e0e9-2fba-42fe-b0c0-848c9e6a8182=Scope"
az ad sp create --id $WebClientID --only-show-errors > $null
az ad app permission grant --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $WebClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
#endregion


#region "STEP 4: Create IdentityExperienceFramework app"
Write-Title "STEP 4: Creating the Identity Experience Framework application"
$IEFAppName = "IdentityExperienceFramework"
$IEFClientID = (az ad app create --display-name $IEFAppName --sign-in-audience AzureADMyOrg --web-redirect-uris https://$B2cTenantName.b2clogin.com/$B2cTenantName.onmicrosoft.com --query appId --output tsv --only-show-errors)

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

Remove-Item userImpersonationScope.json
#endregion


#region "STEP 5: Create ProxyIEF app"
Write-Title "STEP 5: Creating the Proxy Identity Experience Framework application"
$ProxyIEFAppName = "ProxyIdentityExperienceFramework"
$ProxyIEFClientID = (az ad app create --display-name $ProxyIEFAppName --sign-in-audience AzureADMyOrg --public-client-redirect-uris myapp://auth --is-fallback-public-client true --query appId --output tsv --only-show-errors)

Write-Host "Granting permissions to the Proxy IEF application"
az ad sp create --id $ProxyIEFClientID --only-show-errors > $null
az ad app permission grant --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --scope "openid offline_access" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api 00000003-0000-0000-c000-000000000000 --api-permissions $openidPermission $offlineAccessPermission --only-show-errors
az ad app permission grant --id $ProxyIEFClientID --api $IEFClientID --scope "user_impersonation" --only-show-errors > $null
az ad app permission add --id $ProxyIEFClientID --api $IEFClientID --api-permissions "$IEFScopeGUID=Scope" --only-show-errors
#endregion


#region "STEP 6: getting the values we want to replace from the templates"
Write-Title "STEP 6: Getting values to use in the custom policies?"
$HasFaceBookApp = ""
while($HasFaceBookApp -ne "Y" -and $HasFaceBookApp -ne "N"){
    $HasFaceBookApp = Read-Host "Do you have a facebook application set up that you'd like to link? (y/n)"
}
$FacebookId = "00000000-0000-0000-0000-000000000000" #default to meaningless placeholder value if app isn't set up
if($HasFaceBookApp -eq "y"){
	$FacebookId = Read-Host "What is the application ID of the Facebook application you created?"
}
#endregion


#region "STEP 7: looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates"
Write-Title "STEP 7: Creating template custom policies"
Get-ChildItem ".\CustomPolicyTemplates\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path (".\CustomPolicy\"+$_.Name)
}
#endregion


#region "STEP 8: looping through each CustomPolicy and replacing their placeholder values to generate the final custom policies"
Write-Title "STEP 8: Replacing values in template custom policies to generate finalised custom policies"
Get-ChildItem ".\CustomPolicy\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<ProxyIdentityExperienceFrameworkAppId>>', $ProxyIEFClientID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<IdentityExperienceFrameworkAppId>>', $IEFClientID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookId>>', $FacebookId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<MultiTenantAppID>>', $MultitenantAppID) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

}
#endregion

#region "STEP 9: Add signing and encryption keys for the IEF applications"
Write-Title "STEP 9: Adding signing and encryption keys for the IEF applications"

#region "Getting the token to be used in the GET/POST requests"
# relevant docs: https://docs.microsoft.com/en-us/graph/auth-v2-service#4-get-an-access-token
Write-Host "Getting the token to be used in the GET/POST requests"

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/x-www-form-urlencoded")

$body = "client_id=a00baec5-65fc-4488-947f-8584625d47a5&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=qlA8Q~~IUVTBB.snchHBe2V1f6o_6m6-nNOgba0i&grant_type=client_credentials"

$response = Invoke-RestMethod 'https://login.microsoftonline.com/playltib2c.onmicrosoft.com/oauth2/v2.0/token' -Method 'POST' -Headers $headers -Body $body
$access_token = $response.access_token
$access_token = "Bearer " + $access_token
#endregion

$num_months = 0 
while($num_months -le 0){
	[uint16] $num_months = Read-Host "How many months do you want the keys to be valid for? (must be greater than 0)"
}

#region "STEP 9.A: Create the signing key"
Write-Title "STEP 9.A: Creating the Signing Key"

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

Write-Host "Successfully generated the signing key"
#endregion

#endregion


#region "STEP 9.B: Create the encryption key"
Write-Title "STEP 9.B: Creating the Signing Key"

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

Write-Host "Successfully generated the encryption key"
#endregion
#endregion


#region "STEP 9.C: Create the AADSecret keyset"
Write-Title "STEP 9.C: Creating the AADAppSecret Key"

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
`n  `"k`": `""+$ADClientSecret+"`",
`n  `"nbf`": "+$nbf+",
`n  `"exp`": "+$exp+"
`n}"

$response = Invoke-RestMethod "https://graph.microsoft.com/beta/trustFramework/keySets/$AADAppSecret_container_id/uploadSecret" -Method 'POST' -Headers $headers -Body $body

Write-Host "Successfully uploaded the AADAppSecret key"
#endregion

#endregion 
#endregion


#region "STEP 10: uploading the custom policies to the b2c tenant"
#reference: https://docs.microsoft.com/en-us/graph/api/trustframework-post-trustframeworkpolicy?view=graph-rest-beta

Write-Title "STEP 10: Uploading the custom policies to the b2c tenant"

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$headers.Add("Content-Type", "application/xml")

# Order matters in the uploads - do not modify the order
Write-Host "Uploading custom policy TRUSTFRAMEWORKBASE"
[string] $body = Get-Content "./CustomPolicy/TRUSTFRAMEWORKBASE.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body

Write-Host "Uploading custom policy TRUSTFRAMEWORKLOCALIZATION"
[string] $body = Get-Content "./CustomPolicy/TRUSTFRAMEWORKLOCALIZATION.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body

Write-Host "Uploading custom policy TRUSTFRAMEWORKEXTENSIONS"
[string] $body = Get-Content "./CustomPolicy/TRUSTFRAMEWORKEXTENSIONS.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body

Write-Host "Uploading custom policy SIGNUP_SIGNIN"
[string] $body = Get-Content "./CustomPolicy/SIGNUP_SIGNIN.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body

Write-Host "Uploading custom policy PROFILEEDIT"
[string] $body = Get-Content "./CustomPolicy/PROFILEEDIT.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body

Write-Host "Uploading custom policy PASSWORDRESET"
[string] $body = Get-Content "./CustomPolicy/PASSWORDRESET.xml"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies' -Method 'POST' -Headers $headers -Body $body
#endregion