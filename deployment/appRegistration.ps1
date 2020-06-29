$appinfo=$(az ad app create --display-name testregapp --identifier-uris "api://$(New-Guid)") | ConvertFrom-Json
echo "Your Api URI --> $($appinfo.identifierUris)"
echo "Your Client Id --> $($appinfo.appId)"