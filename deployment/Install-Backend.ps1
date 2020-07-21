function Publish-FunctionApp {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$fnName,
        [Parameter(Mandatory)]
        [string]$projectDir,
        [Parameter(Mandatory)]
        [string]$outputDir,
        [Parameter(Mandatory)]
        [string]$resourceGroupName,
        [Parameter(Mandatory)]
        [string]$functionAppName
    )

    $publishDir = Join-Path $outputDir $fnName
    Write-Log "Building -- $publishDir"
    dotnet publish $projectDir --configuration RELEASE --output $publishDir --nologo --verbosity quiet

    $zipPath = Join-Path $outputDir "$fnName.zip"
    Write-Log "Zipping Artifacts -- $zipPath"
    Compress-Archive -Path "$publishDir/*" -DestinationPath $zipPath

    Write-Log "Deploying to Azure -- $resourceGroupName/$functionAppName"
    $result = az functionapp deployment source config-zip -g $resourceGroupName -n $functionAppName --src $zipPath | ConvertFrom-Json
    if(!$result) {
        throw "Failed to deploy $fnName to $functionAppName"
    }
}
function Install-Backend {
 
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$BackendRoot,
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string[]]$FunctionAppNames
    )

    Push-Location $BackendRoot
    Write-Title "Installing the backend"
    
    $publishRoot = 'Artifacts'
    if(Test-Path $publishRoot) {
        Write-Log "Deleting old Artifacts"
        Remove-Item -LiteralPath $publishRoot -Recurse -Force
    }
    
    $fnRegex = "Functions/**/*.csproj"
    $functions = Get-ChildItem -Path $fnRegex -Recurse
    foreach ($function in $functions) {
        $fnName = $VALID_FUNCTIONS | Where-Object { $function.Directory.Name -like "Edna.*$_" }
        $projectDir = $function.Directory
        $functionAppName = $FunctionAppNames | Where-Object { $_ -like "$fnName-*" }
        Publish-FunctionApp $fnName $projectDir $publishRoot $ResourceGroupName $functionAppName
    }
    
    Write-Log 'Deleting Artifacts'
    Remove-Item -LiteralPath $publishRoot -Recurse -Force
    
    Write-Title 'Backend Installation Completed'
    Pop-Location
}