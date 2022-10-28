# Overview

## Microsoft Learn LTI Application 

The Microsoft Learn LTI Application uses three services, links to the pricing for these services can be found here:
* [Azure Functions](https://azure.microsoft.com/pricing/details/functions/?WT.mc_id=academic-80547-leestott)
* [Azure Storage](https://azure.microsoft.com/pricing/details/storage/files/?WT.mc_id=academic-80547-leestott)
* [Azure Key Vault](https://azure.microsoft.com/pricing/details/key-vault/?WT.mc_id=academic-80547-leestott)

### Summary
We estimate the total cost of these services to be **less than $20 USD per month** per Institution installation based on deployment and usage in line with that stipulated in the deployment guide. This a cost per institution installation not a cost per user.

### Functions

![Azure Functions](/images/Pricing.Functions.PNG)
### Storage
![Azure Storage](/images/Pricing.Storage.PNG)
### Key Vault 
![Azure Key Vault](/images/Pricing.KeyVault.PNG)

## Microsoft Learn Organisational Reporting Tool 
[Getting Started with Learn Organisation Reporting](https://learn.microsoft.com/training/support/org-reporting?WT.mc_id=academic-80547-leestott)
### Example of costs 
- A small tenant with about 10 users, completing about 10-20 modules a piece is spending ~$4 USD/month with public pricing (SQL DB size 5GB; actual used storage is 37 MB). 
- A very large tenant (100,000+ users; average completion is 20+ modules) uses a little over 5 GB of SQL DB storage.

### Pricing 
Both of those SQL DBs are DTP (not vCore), because it’s not really production data and it doesn’t need to be accessed often (1+ per day). Overall, we believe the fees are very, very low. It’s effectively just the storage fees.

### Microsoft Enterprise Costs 
We would of course advise an internal IT contact and/or a MSFT account manager to better estimate specific billing scenario to totally confirm, based on organization’s pricing and licenses and architectual design.


