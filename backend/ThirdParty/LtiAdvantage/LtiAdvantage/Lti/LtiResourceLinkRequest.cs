using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LtiAdvantage.AssignmentGradeServices;
using LtiAdvantage.NamesRoleProvisioningService;
using LtiAdvantage.Utilities;

namespace LtiAdvantage.Lti
{
    /// <inheritdoc />
    /// <summary>
    /// https://purl.imsglobal.org/spec/lti/v1p3/schema/json/LtiResourceLinkRequest.json
    /// </summary>
    [SuppressMessage("ReSharper", "ClassNeverInstantiated.Global")]
    public class LtiResourceLinkRequest : LtiRequest
    {
        #region Constructors

        /// <inheritdoc />
        /// <summary>
        /// Create an instance of <see cref="T:LtiAdvantage.Lti.LtiResourceLinkRequest" /> with default values
        /// for the MessageType and Version claims.
        /// </summary>
        public LtiResourceLinkRequest()
        {
            MessageType = Constants.Lti.LtiResourceLinkRequestMessageType;
            Version = Constants.Lti.Version;
        }

        /// <inheritdoc />
        /// <summary>
        /// Create an instance of <see cref="T:LtiAdvantage.Lti.LtiResourceLinkRequest" /> with the claims.
        /// </summary>
        /// <param name="claims">A list of claims.</param>
        public LtiResourceLinkRequest(IEnumerable<Claim> claims) : base(claims)
        {
        }

        /// <inheritdoc />
        /// <summary>
        /// Create an instance of <see cref="T:LtiAdvantage.Lti.LtiResourceLinkRequest" /> with the
        /// claims in payload.
        /// </summary>
        /// <param name="payload"></param>
        public LtiResourceLinkRequest(JwtPayload payload) : base(payload.Claims)
        {
        }

        #endregion

        #region Required Message Claims

        // See https://www.imsglobal.org/spec/lti/v1p3/#required-message-claims
        // See https://openid.net/specs/openid-connect-core-1_0.html#Claims
        // See https://purl.imsglobal.org/spec/lti/v1p3/schema/json/Token.json

        /// <summary>
        /// The Assignment and Grade Services claim.
        /// </summary>
        public AssignmentGradeServicesClaimValueType AssignmentGradeServices
        {
            get { return this.GetClaimValue<AssignmentGradeServicesClaimValueType>(Constants.LtiClaims.AssignmentGradeServices); }
            set { this.SetClaimValue(Constants.LtiClaims.AssignmentGradeServices, value);}
        }

        /// <summary>
        /// The Names and Roles Provisioning Service claim.
        /// </summary>
        public NamesRoleServiceClaimValueType NamesRoleService
        {
            get { return this.GetClaimValue<NamesRoleServiceClaimValueType>(Constants.LtiClaims.NamesRoleService); }
            set { this.SetClaimValue(Constants.LtiClaims.NamesRoleService, value);}
        }

        /// <summary>
        /// The required https://purl.imsglobal.org/spec/lti/claim/resource_link claim composes
        /// properties for the resource link from which the launch message occurs.
        /// <example>
        /// {
        ///   "id": "200d101f-2c14-434a-a0f3-57c2a42369fd",
        ///   ...
        /// }
        /// </example>
        /// </summary>
        public ResourceLinkClaimValueType ResourceLink
        {
            get { return this.GetClaimValue<ResourceLinkClaimValueType>(Constants.LtiClaims.ResourceLink); }
            set { this.SetClaimValue(Constants.LtiClaims.ResourceLink, value); }
        }

        #endregion
    }
}
