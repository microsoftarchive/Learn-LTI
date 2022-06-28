#region "Helper Functions"

#function for making clear and distinct titles
function Write-Title([string]$Title) {
    Write-Host "`n`n============================================================="
    Write-Host $Title
    Write-Host "=============================================================`n`n"
}
#endregion


#getting the values we want to replace from the templates
Write-Title "STEP 1: Getting values to use in the custom policies?"
$B2cTenantName = Read-Host "What is the name of your b2c tenant?"
$ProxyIdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the ProxyIdentityExperienceFramework application you created?"
$IdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the IdentityExperienceFramework application you created?"
$FacebookId = Read-Host "What is the application ID of the Facebook application you created?"


# looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates
Write-Title "STEP 2: Creating template custom policies"
Get-ChildItem ".\CustomPolicyTemplates\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path (".\CustomPolicy\"+$_.Name)
}



# looping through each CustomPolicy and replacing their placeholder values to generate the final custom policies
Write-Title "STEP 3: Replacing values in template custom policies to generate finalised custom policies"
Get-ChildItem ".\CustomPolicy\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<ProxyIdentityExperienceFrameworkAppId>>', $ProxyIdentityExperienceFrameworkAppId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<IdentityExperienceFrameworkAppId>>', $IdentityExperienceFrameworkAppId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookId>>', $FacebookId) |  Set-Content -path (".\CustomPolicy\"+$_.Name)

}


# Connecting to the b2c tenant and uploading the custom policies to the b2c tenant
Write-Title "STEP 4: Uploading the custom policies to the b2c tenant"

$B2cTenantDomain = Read-Host "What is your B2C tenants domain (e.g. mytenant.onmicrosoft.com)?"
Write-Host "Importing Module AzureADPreview"
Import-Module AzureADPreview
Write-Host "Connecting to the tenant"
Connect-AzureAD -Tenant $B2cTenantDomain

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