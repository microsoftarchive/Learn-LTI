# List of known Azure Functions to Install / Publish.
# Update this list on adding / updating any Function. 
enum VALID_FUNCTIONS {
    AssignmentLearnContent;
    AssignmentLinks;
    Assignments;
    Connect;
    Platforms;
    Users
}

function Get-Project([VALID_FUNCTIONS]$FunctionName) {
    $PathRegex = "Functions/**/Edna.$FunctionName.csproj"
    Get-ChildItem -Path $PathRegex -Recurse
}

function Publish-FunctionApp {

    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string]$FunctionName,
        [Parameter(Mandatory)]
        [string]$ProjectDir,
        [Parameter(Mandatory)]
        [string]$OutputDir,
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [Parameter(Mandatory)]
        [string]$FunctionAppName
    )

    $PublishDir = Join-Path $OutputDir $FunctionName
    Write-Host "Building -- $PublishDir"
    dotnet publish $ProjectDir --configuration RELEASE --output $PublishDir --nologo --verbosity quiet

    $ArchivePath = Join-Path $OutputDir "$FunctionName.zip"
    Write-Host "Zipping Artifacts -- $ArchivePath"
    Compress-Archive -Path "$PublishDir/*" -DestinationPath $ArchivePath

    Write-Host "Deploying to Azure -- $ResourceGroupName/$FunctionAppName"
    $result = az functionapp deployment source config-zip -g $ResourceGroupName -n $FunctionAppName --src $ArchivePath | ConvertFrom-Json
    if(!$result) {
        throw "Failed to deploy $FunctionName to $FunctionAppName"
    }
}

function Install-Backend {
 
    [CmdletBinding(SupportsShouldProcess)]
    param (
        [Parameter(Mandatory)]
        [string]$SourceRoot,
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,
        [string]$LearnContentFunctionAppName,
        [string]$LinksFunctionAppName,
        [string]$AssignmentsFunctionAppName,
        [string]$ConnectFunctionAppName,
        [string]$PlatformsFunctionAppName,
        [string]$UsersFunctionAppName
    )

    Push-Location $SourceRoot

    try {
        $PublishRoot = 'Artifacts'
        if(Test-Path $PublishRoot) {
            Write-Host "Deleting old Artifacts"
            Remove-Item -LiteralPath $PublishRoot -Recurse -Force
        }
        
        try {            
            $Functions = [System.Enum]::GetNames([VALID_FUNCTIONS])
            foreach ($Function in $Functions) {

                Write-Host "Installing Function -- $Function"
                $Project = Get-Project $Function

                $PublishParams = @{
                    FunctionName = $Function;
                    ProjectDir = $($Project.Directory);
                    OutputDir = $PublishRoot;
                    ResourceGroupName = $ResourceGroupName
                }

                $FunctionAppName = & {
                    switch ($Function) {
                        "AssignmentLearnContent"    { return $LearnContentFunctionAppName }
                        "AssignmentLinks"           { return $LinksFunctionAppName }
                        "Assignments"               { return $AssignmentsFunctionAppName }
                        "Connect"                   { return $ConnectFunctionAppName }
                        "Platforms"                 { return $PlatformsFunctionAppName }
                        "Users"                     { return $UsersFunctionAppName }
                    }
                }
                if ($FunctionAppName) { 
                    $PublishParams.FunctionAppName = $FunctionAppName
                }

                Publish-FunctionApp @PublishParams
            }
        }
        finally {            
            Write-Host 'Deleting Artifacts'
            Remove-Item -LiteralPath $publishRoot -Recurse -Force
        }
    }
    finally {
        Pop-Location   
    }    
}