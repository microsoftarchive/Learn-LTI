/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */

export const b2cPolicies = {
  names: {
    signIn: 'B2C_1A_SIGNIN' // custom policy
  },
  authorities: {
    signIn: {
      authority:
        `https://` +
        process.env.REACT_APP_EDNA_B2C_TENANT! +
        `.b2clogin.com/` +
        process.env.REACT_APP_EDNA_B2C_TENANT! +
        '.onmicrosoft.com/b2c_1a_signin'
    }
  },
  authorityDomain: process.env.REACT_APP_EDNA_B2C_TENANT! + `.b2clogin.com`
};
