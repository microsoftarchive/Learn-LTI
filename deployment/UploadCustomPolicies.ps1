#function for making clear and distinct titles
function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}

#region "Importing Modules"
Write-Title "Importing Modules"
Write-Host "Importing Module AzureADPreview" # REQUIRES THE PREVIEW VERSION
Import-Module AzureADPreview
Write-Host "Importing Module Microsoft.Graph.Identity.SignIns"
Import-Module Microsoft.Graph.Identity.SignIns
#endregion



#region "STEP 1: getting the values we want to replace from the templates"
Write-Title "STEP 1: Getting values to use in the custom policies?"
$B2cTenantName = Read-Host "What is the name of your b2c tenant?"
$ProxyIdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the ProxyIdentityExperienceFramework application you created?"
$IdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the IdentityExperienceFramework application you created?"
$FacebookId = Read-Host "What is the application ID of the Facebook application you created?"
#endregion


#region "STEP 2: looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates"
Write-Title "STEP 2: Creating template custom policies"
Get-ChildItem ".\CustomPolicyTemplates\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path (".\CustomPolicy\"+$_.Name)
}
#endregion


#region "STEP 3: looping through each CustomPolicy and replacing their placeholder values to generate the final custom policies"
Write-Title "STEP 3: Replacing values in template custom policies to generate finalised custom policies"
Get-ChildItem ".\CustomPolicy\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<ProxyIdentityExperienceFrameworkAppId>>', $ProxyIdentityExperienceFrameworkAppId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<IdentityExperienceFrameworkAppId>>', $IdentityExperienceFrameworkAppId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookId>>', $FacebookId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

}
#endregion

#region "STEP 4: Connecting to the b2c tenant"
Write-Title "STEP 4: Connecting to the b2c tenant"

$B2cTenantDomain = Read-Host "What is your B2C tenants domain (e.g. mytenant.onmicrosoft.com)?"
Write-Host "Connecting to the tenant"
Connect-AzureAD -Tenant $B2cTenantDomain
#endregion

#region "STEP 5: Add signing and encryption keys for the IEF applications"
Write-Title "STEP 5: Adding signing and encryption keys for the IEF applications"

#region "Getting the token to be used in the GET/POST requests"
# relevant docs: https://docs.microsoft.com/en-us/graph/auth-v2-service#4-get-an-access-token
Write-Host "Getting the token to be used in the GET/POST requests"

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/x-www-form-urlencoded")

$body = "client_id=a00baec5-65fc-4488-947f-8584625d47a5&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=qlA8Q~~IUVTBB.snchHBe2V1f6o_6m6-nNOgba0i&grant_type=client_credentials"

$response = Invoke-RestMethod 'https://login.microsoftonline.com/playltib2c.onmicrosoft.com/oauth2/v2.0/token' -Method 'POST' -Headers $headers -Body $body
$access_token = $response.access_token
#endregion

[uint16] $num_months = Read-Host "How many months do you want the keys to be valid for? (must be greater than 0)"

#region "STEP 5.A: Create the signing key"
Write-Title "STEP 5.A: Creating the Signing Key"

#region "Creating the signing keyset (container)""
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
#calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
Write-Host "`nGenerating the signing key and uploading to the keyset`n"
$start_date = Get-Date -Date "1970-01-01 00:00:00Z"
$date = Get-Date
$nbf = [math]::floor(($date - $start_date).TotalSeconds)
$exp = [math]::floor($nbf + $num_months * 60 * 60 * 24 * 30)


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
$response | ConvertTo-Json
Write-Host "Successfully generated the signing key"
#endregion

#endregion


#region "STEP 5.B: Create the encryption key"
Write-Title "STEP 5.B: Creating the Signing Key"

#region "Creating the encryption keyset (container)""
Write-Host "`nCreating the signing keyset (container)`n"
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$headers.Add("Content-Type", "application/json")

$body = "{`"id`":`"B2C_1A_TokenEncryptionKeyContainer`"}"

$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets' -Method 'POST' -Headers $headers -Body $body
$encryption_container_id = $response.id

Write-Host "Successfully created the key encryption container: "+$encryption_container_id
#endregion


#region "Generating the encryption key"
#calculating nbf (not before) and exp (expiry) tokens into the json required format of seconds past after 1970-01-01T00:00:00Z UTC
Write-Host "`nGenerating the encryption key and uploading to the keyset`n"
$start_date = Get-Date -Date "1970-01-01 00:00:00Z"
$date = Get-Date
$nbf = [math]::floor(($date - $start_date).TotalSeconds)
$exp = [math]::floor((($date - $start_date).TotalSeconds) + $num_months * 60 * 60 * 24 * 30)


$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)
$headers.Add("Content-Type", "application/json")

$body = "{
`n  `"use`": `"enc`",
`n  `"kty`": `"RSA`",
`n  `"nbf`": "+$nbf+",
`n  `"exp`": "+$exp+",
`n}"

$response = Invoke-RestMethod ('https://graph.microsoft.com/beta/trustFramework/keySets/'+$encryption_container_id+'/generateKey') -Method 'POST' -Headers $headers -Body $body
$response | ConvertTo-Json

Write-Host "Successfully generated the encryption key"
#endregion

#endregion 


#region "STEP 6: uploading the custom policies to the b2c tenant"
Write-Title "STEP 6: Uploading the custom policies to the b2c tenant"

# Order matters in the uploads - do not modify the order
$currentDir = Get-Location
$currentDir = $currentDir.tostring()

Write-Host "Uploading custom policy TRUSTFRAMEWORKBASE"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\TRUSTFRAMEWORKBASE.xml")

Write-Host "Uploading custom policy TRUSTFRAMEWORKLOCALIZATION"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\TRUSTFRAMEWORKLOCALIZATION.xml")

Write-Host "Uploading custom policy TRUSTFRAMEWORKEXTENSIONS"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\TRUSTFRAMEWORKEXTENSIONS.xml")

Write-Host "Uploading custom policy SIGNUP_SIGNIN"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\SIGNUP_SIGNIN.xml")

Write-Host "Uploading custom policy PROFILEEDIT"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\PROFILEEDIT.xml")

Write-Host "Uploading custom policy PASSWORDRESET"
New-AzureADMSTrustFrameworkPolicy -InputFilePath ($currentDir+"\CustomPolicy\PASSWORDRESET.xml")
#endregion