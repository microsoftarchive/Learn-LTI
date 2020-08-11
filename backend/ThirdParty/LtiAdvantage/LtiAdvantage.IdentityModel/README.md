# LtiAdvantage.IdentityModel

LtiAdvantage.IdentityModel has an HttpClient extension method to request a token using JWT client credentials in the
[IMS recommended format](https://www.imsglobal.org/spec/security/v1p0#using-json-web-tokens-with-oauth-2-0-client-credentials-grant)
for client-credentials grant.

## .NET Standard

This library targets `netstandard2.0` and uses [IdentityModel](https://github.com/IdentityModel/IdentityModel2).

## Getting Started


```
var tokenResponse = await httpClient.RequestClientCredentialsTokenWithJwtAsync(
    new JwtClientCredentialsTokenRequest
    {
        Address = tokenEndPoint,
        Jwt = jwt,
        Scope = Constants.LtiScopes.NamesRoleReadonly
     });
```

There are two sample applications you can reference for ideas:
- [Sample Tool](https://github.com/andyfmiller/LtiAdvantageTool)
- [Sample Platform](https://github.com/andyfmiller/LtiAdvantagePlatform)