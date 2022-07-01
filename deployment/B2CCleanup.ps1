#region "Helper Functions"

#function for making clear and distinct titles
function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}
#endregion

#region "Deleting the generated applications"
Write-Title "STEP 1: Deleting the generated applications"
$AppInfoCSVPath = ".\AppInfo.csv"
$AppInfo = Import-Csv -Path $AppInfoCSVPath -Header @("AppID", "TenantID")
$LastTenantID = ""
foreach ($info in $AppInfo) {
    $id = $info.AppID
    $tid = $info.TenantID
    if ($tid -ne $LastTenantID) {
        $LastTenantID = $tid
        Write-Host "Please login to $tid via the pop-up window that has launched in your browser"
        az login --tenant "$tid.onmicrosoft.com" --allow-no-subscriptions --only-show-errors > $null
    }
    Write-Host "Deleting $id from $tid"
    az ad app delete --id $id --only-show-errors
}
#endregion

#region "Getting the token to be used in the HTML REQUESTS"
# relevant docs: https://docs.microsoft.com/en-us/graph/auth-v2-service#4-get-an-access-token
Write-Title "STEP 2: Getting the token to be used in the HTML REQUESTS"

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/x-www-form-urlencoded")

$body = "client_id=a00baec5-65fc-4488-947f-8584625d47a5&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=qlA8Q~~IUVTBB.snchHBe2V1f6o_6m6-nNOgba0i&grant_type=client_credentials"

$response = Invoke-RestMethod 'https://login.microsoftonline.com/playltib2c.onmicrosoft.com/oauth2/v2.0/token' -Method 'POST' -Headers $headers -Body $body
$access_token = $response.access_token
$access_token = "Bearer " + $access_token
#endregion


#region "Connecting to the b2c tenant and removing the custom policies already uploaded to the b2c tenant"
#reference: https://docs.microsoft.com/en-us/graph/api/trustframeworkpolicy-delete?view=graph-rest-beta&tabs=http
Write-Title "STEP 3: Cleaning up the custom policies from the b2c tenant"

$B2cTenantDomain = Read-Host "What is your B2C tenants domain (e.g. mytenant.onmicrosoft.com)?"

$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)

Write-Host "Deleting B2C_1A_TrustFrameworkBase"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_TrustFrameworkBase' -Method 'DELETE' -Headers $headers

Write-Host "Deleting B2C_1A_TrustFrameworkLocalization"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_TrustFrameworkLocalization' -Method 'DELETE' -Headers $headers

Write-Host "Deleting B2C_1A_TrustFrameworkExtensions"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_TrustFrameworkExtensions' -Method 'DELETE' -Headers $headers

Write-Host "Deleting B2C_1A_signup_signin"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_signup_signin' -Method 'DELETE' -Headers $headers

Write-Host "Deleting B2C_1A_ProfileEdit"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_ProfileEdit' -Method 'DELETE' -Headers $headers

Write-Host "Deleting B2C_1A_PasswordReset"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/policies/B2C_1A_PasswordReset' -Method 'DELETE' -Headers $headers
#endregion

#region "Cleaning up the keysets from the b2c tenant"
Write-Title "Cleaning up the keysets from the b2c tenant"
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Authorization", $access_token)

Write-Host "Deleting B2C_1A_TokenSigningKeyContainer keyset"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets/B2C_1A_TokenSigningKeyContainer' -Method 'DELETE' -Headers $headers
Write-Host "Deleting B2C_1A_TokenEncryptionKeyContainer keyset"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets/B2C_1A_TokenEncryptionKeyContainer' -Method 'DELETE' -Headers $headers
Write-Host "Deleting B2C_1A_AADAppSecret keyset"
$response = Invoke-RestMethod 'https://graph.microsoft.com/beta/trustFramework/keySets/B2C_1A_AADAppSecret' -Method 'DELETE' -Headers $headers
#endregion