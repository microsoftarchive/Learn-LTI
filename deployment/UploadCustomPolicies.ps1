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
$B2cTenantObjectId = Read-Host "What is the object ID of your b2c tenant?"
$ProxyIdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the ProxyIdentityExperienceFramework application you created?"
$IdentityExperienceFrameworkAppId = Read-Host "What is the application ID of the IdentityExperienceFramework application you created?"
$FacebookId = Read-Host "What is the application ID of the Facebook application you created?"
$FacebookSecret = Read-Host "What is the value of your facebook applications secret?"


# looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates
Write-Title "STEP 2: Creating template custom policies"
Get-ChildItem ".\CustomPolicyTemplates\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path ("./CustomPolicy/"+$_.Name)
}



# looping through each CustomPolicy and replacing their placeholder values to generate the final custom policies
Write-Title "STEP 3: Replacing values in template custom policies to generate finalised custom policies"
Get-ChildItem ".\CustomPolicy\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path ("./CustomPolicy/"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantObjectID>>', $B2cTenantObjectId) |  Set-Content -path ("./CustomPolicy/"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<ProxyIdentityExperienceFrameworkAppId>>', $ProxyIdentityExperienceFrameworkAppId) |  Set-Content -path ("./CustomPolicy/"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<IdentityExperienceFrameworkAppId>>', $IdentityExperienceFrameworkAppId) |  Set-Content -path ("./CustomPolicy/"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookId>>', $FacebookId) |  Set-Content -path ("./CustomPolicy/"+$_.Name)
    
    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookSecret>>', $FacebookSecret) |  Set-Content -path ("./CustomPolicy/"+$_.Name)

}
