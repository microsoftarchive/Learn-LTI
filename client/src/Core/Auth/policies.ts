/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
  names: {
    signUpSignIn: 'B2C_1_Dummy_Test_sign' // RB make not hardcoded
  },
  authorities: {
    signUpSignIn: {
      // RB not sure if i have to modify this
      authority: 'https://uclmscltib2c.b2clogin.com/uclmscltib2c.onmicrosoft.com/B2C_1_Dummy_Test_sign'
      //https://uclmscltib2c.b2clogin.com/uclmscltib2c.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_Dummy_Test_sign&client_id=9cb02f8b-244d-4c34-904f-72633041512a&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A6420%2F&scope=openid&response_type=id_token&prompt=login
    }
  },
  authorityDomain: 'uclmscltib2c.b2clogin.com' // RB: don't hardcode
};
