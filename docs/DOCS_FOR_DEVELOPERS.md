# Docs for Developers

The purpose of this documentation is to help inform prospective contributors and developers on how the current solution works so that they can more easily contribute to the repository.

If you only intended to use the program and not edit its internal code, you are probably looking for [The Deployment Guide](DEPLOYMENT_GUIDE.md)

## Architecture of the Authentication solution

### Legacy AD Architecture

| AD Architecture (Legacy) | B2C Architecture (Recommended)|
| - | - |
| <img src="../images/Developer/AD_Architecture.png" width="100%"/> | <img src="../images/Developer/B2C_Architecture.png" width="100%" /> |



### B2C Architecture



### B2C Usage For Multi-Tenant Auth

* The B2C Tenant serves as the central resource for authenticating users. This is configured with a whitelist of allowed tenants during setup and only users from a permitted tenant are allowed to authenticate.


### Token Validation

* Bearer tokens are used to authenticate users. These tokens are issued by the Azure AD B2C Tenant which retrieves users' information from different identity providers (e.g., the AD tenant of a University). These tokens are signed by the B2C tenant but are unencrypted, therefore their integrity is checked to ensure they have not been forged nor tampered with; and their audience, lifetime, issuer and nonce claims are checked and validated.
* To validate the token signature and claims the LTI backend users the Configuration Manager C# libraries to retrieve information about the AD and B2C tenants at runtime.



### React Framework

* React framework is used to dynamically render and update the pages in the LTI web applications.
* When an assignment link is clicked the LTI tool will authenticate the user against B2C AAD befroe allowing access to the assignment. the authentication process will acquire an access token for the user with their credentials and use that to allow access to the assignment.

### Deploy scripts'

* The Deploy script creates and configures all the resources required for an organisation to use Learn-LTI on the Universities existing AD and B2C tenants.

#### Main Deploy Script
* At the start of the script there is a READ-HOST asking the user to select 'ad' or 'b2c' mode; this value is stored and used to house AD and B2C specific code inside conditional if blocks.
* Azure CLI is used for this purpose, prompting the user to first login with an account with sufficient permissions then using the Azure CLI to create and configure those resources on the Moodle.

#### B2C SubDeploy Script
* The B2C Deploy script works similarly using the Azure CLI to pprompt the user to login when switching Tenants (from AD or B2C) then sets up the additional components required solely for B2C deploy
* The B2C Deploy script, however, uses HTTP requests predominantly for the creation and configuration of the apps due to the ease of making these work for multiple OS' 




## Authentication Code


## Overall architecture of the LTI application



