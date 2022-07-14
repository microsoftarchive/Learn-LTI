/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
  names: {
    signIn: 'B2C_1A_SIGNUP_SIGNIN' // RB make not hardcoded
  },
  authorities: {
    signIn: {
      authority: `https://ltimoodleb2c.b2clogin.com/ltimoodleb2c.onmicrosoft.com/b2c_1a_signup_signin`
    }
  },
  authorityDomain: 'ltimoodleb2c.b2clogin.com' // RB: don't hardcode
};
