@echo off
REM --------------------------------------------------------------------------------------------
REM Copyright (c) Microsoft Corporation. All rights reserved.
REM Licensed under the MIT license.
REM --------------------------------------------------------------------------------------------

REM Triggers Learn-LTI Cleanup process for bad installations 
REM This script will remove all orphaned resources from your Azure Subscription which were associated to a failed deployment of the Microsoft Learn LTI Application.
PowerShell.exe -ExecutionPolicy Bypass -File .\cleanup.ps1
