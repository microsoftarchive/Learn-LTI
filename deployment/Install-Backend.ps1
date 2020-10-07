# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

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

function Write-BackendDebugLog {
    param (
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    if( Get-Command 'Write-Log' -ErrorAction SilentlyContinue) {
        Write-Log -Message $Message
    }
    else {
        Write-Verbose $Message -Verbose
    }
}

function Get-Project([VALID_FUNCTIONS]$FunctionName) {
    $PathRegex = "Functions/**/Edna.$FunctionName.csproj"
    $Project = Get-ChildItem -Path $PathRegex -Recurse
    if(!$Project) {
        throw "Could not find a Project File that matches [ $PathRegex ] path"
    }
    Write-Output $Project
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
    Write-BackendDebugLog -Message "Building [ $ProjectDir ] --> [ $PublishDir ]"
    $PublishLogs = dotnet publish $ProjectDir --configuration RELEASE --output $PublishDir --nologo
    if($LASTEXITCODE -ne 0) {
        Write-BackendDebugLog -Message ($PublishLogs -join "`n")
        throw "Errors while building Function App [ $FunctionName ]"
    }

    $ArchivePath = Join-Path $OutputDir "$FunctionName.zip"
    Write-BackendDebugLog -Message "Zipping Artifacts [ $PublishDir ]/* --> [ $ArchivePath ]"
    try {
        Compress-Archive -Path "$PublishDir/*" -DestinationPath $ArchivePath -Force -ErrorAction Stop
    }
    catch {
        Write-BackendDebugLog -Message "Errors while compressing artifacts for Function App [ $FunctionName ]"
        throw $_
    }

    Write-BackendDebugLog -Message "Deploying to Azure Function App [ $ResourceGroupName/$FunctionAppName ]"
    # Turning Error only mode to reduce clutter on the terminal
    $result = az functionapp deployment source config-zip -g $ResourceGroupName -n $FunctionAppName --src $ArchivePath --only-show-errors | ConvertFrom-Json
    if(!$result) {
        throw "Failed to deploy Function App [ $FunctionName ]"
    }

    Write-Output "Function App [ $FunctionName ] Published Successfully"
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

    Write-BackendDebugLog -Message "Switching to [$SourceRoot] as working directory"
    Push-Location $SourceRoot

    $PublishRoot = 'Artifacts'
    if(Test-Path $PublishRoot) {
        Write-BackendDebugLog -Message "Deleting existing Artifacts"
        Remove-Item -LiteralPath $PublishRoot -Recurse -Force
    }
    
    try {            
        $Functions = [System.Enum]::GetNames([VALID_FUNCTIONS])
        foreach ($Function in $Functions) {

            Write-BackendDebugLog -Message "Installing FunctionApp -- $Function"

            $Project = Get-Project $Function

            Write-BackendDebugLog -Message "Publishing Project [ $($Project.Name) ] as FunctionApp"

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
            } else {
                $MissingFunctionAppName = "Unable to map [ $Function ] to any Azure FunctionAppName"
                Write-BackendDebugLog -Message $MissingFunctionAppName
                Write-Warning $MissingFunctionAppName
            }

            Publish-FunctionApp @PublishParams
        }
        
        Write-Output "Backend Installation Completed Successfully"
    }
    finally {
        Pop-Location   
    }    
}