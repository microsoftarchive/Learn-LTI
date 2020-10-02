# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT license.
# --------------------------------------------------------------------------------------------

[System.IO.FileInfo]$Script:LTI_LOG_FILE = $null

function Write-LogInternal {
    param (
        [Parameter(Mandatory)]
        [String]$Message
    )
    
    $now = (Get-Date).ToString()
    $logMsg = "[ $now ] - $Message"
    
    if( $Script:LTI_LOG_FILE ) {
        $logMsg >> $Script:LTI_LOG_FILE
        # Print the output on the screen, if running verbose
        Write-Verbose -Message $logMsg
    }
    else {
        # No LogFile set, print output on screen instead
        Write-Host $logMsg
    }
}

function Set-LogFile {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [System.IO.FileInfo]$Path
    )
    
    process {
        # We'd append the logs to this File
        $Script:LTI_LOG_FILE = $Path
    }
}

function Write-Log {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory)]
        [string]$Message,
        $ErrorRecord
    )

    process {
        # credits: Tim Curwick for providing this insight
        if( $ErrorRecord -is [System.Management.Automation.ErrorRecord] ) {
            Write-LogInternal "[ERROR] - Exception.Message [ $($ErrorRecord.Exception.Message) ]"
            Write-LogInternal "[ERROR] - Exception.Type    [ $($ErrorRecord.Exception.GetType()) ]"
            Write-LogInternal "[ERROR] - $Message"
        }
        else {
            Write-LogInternal "[INFO] - $Message"
        }
    }
}