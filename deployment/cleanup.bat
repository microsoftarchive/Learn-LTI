@echo off
REM --------------------------------------------------------------------------------------------
REM Copyright (c) Microsoft Corporation. All rights reserved.
REM Licensed under the MIT license.
REM --------------------------------------------------------------------------------------------

REM Triggers Learn-LTI Cleanup process for bad installations 
REM This script will remove all orphaned resources from your azure subscription.
PowerShell.exe -ExecutionPolicy Bypass -File .\Cleanup.ps1