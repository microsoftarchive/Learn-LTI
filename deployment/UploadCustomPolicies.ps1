
#getting the values we want to replace from the templates
$B2cTenantName = Read-Host "What is the name of your b2c tenant?"
$B2cTenantObjectId = Read-Host "What is the object ID of your b2c tenant?"
$FacebookSecret = Read-Host "What is the value of your facebook secret"



# looping through each CustomPolicyTemplate and creating bases of them in CustomTemplates
Get-ChildItem ".\CustomPolicyTemplates\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw)) | Set-Content -path ("./CustomPolicy/"+$_.Name)
}


Read-Host "temp"


# looping through each CustomPolicy and replacing their placeholder values
Get-ChildItem ".\CustomPolicy\" | 
Foreach-Object {
    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantName>>', $B2cTenantName) |  Set-Content -path ("./CustomPolicy/"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<B2CTenantObjectID>>', $B2cTenantObjectId) |  Set-Content -path ("./CustomPolicy/"+$_.Name)

    ((Get-Content -path $_.FullName -Raw) -replace '<<FacebookSecret>>', $FacebookSecret) |  Set-Content -path ("./CustomPolicy/"+$_.Name)
}
