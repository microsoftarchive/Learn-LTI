using System;
using LtiAdvantage.Lti;

namespace LtiAdvantage.NamesRoleProvisioningService
{
    /// <summary>
    /// Represents a GetMembership request.
    /// </summary>
    /// <remarks>
    /// Does not support membership differences.
    /// See https://www.imsglobal.org/spec/lti-nrps/v2p0#membership-differences.
    /// </remarks>
    public class GetMembershipRequest
    {
        /// <summary>
        /// Initialize a new instance of the class.
        /// </summary>
        /// <param name="contextId">Required context id.</param>
        /// <param name="limit">Optional limit to the number of members to return.</param>
        /// <param name="rlid">Optional resource link filter for members with access to resource link.</param>
        /// <param name="role">Optional role filter for members that have the specified role.</param>
        public GetMembershipRequest(string contextId, int? limit = null, string rlid = null, Role? role = null)
        {
            ContextId = contextId ?? throw new ArgumentNullException(nameof(contextId));
            Limit = limit;
            Rlid = rlid;
            Role = role;
        }

        /// <summary>
        /// Required context ID of the membership context. For example, the course from which to get the membership.
        /// </summary>
        public string ContextId { get; }

        /// <summary>
        /// Specifies the maximum number of members to return.
        /// </summary>
        /// <remarks>
        /// This parameter is merely a hint. The server is not obligated to honor this
        /// limit and may at its own discretion choose a different value for the number
        /// of members to return.
        /// See https://www.imsglobal.org/spec/lti-nrps/v2p0#limit-query-parameter
        /// </remarks>
        public int? Limit { get; }

        /// <summary>
        /// <see cref="ResourceLinkClaimValueType.Id"/> filter for members to return.
        /// </summary>
        /// <remarks>
        /// The ID of a resource link within the context. The result set will be filtered
        /// so that it includes only members that are permitted to access the resource link.
        /// If omitted, the result set will include all members of the context with access
        /// to any resource.
        /// See https://www.imsglobal.org/spec/lti-nrps/v2p0#resource-link-id-query-parameter.
        /// </remarks>
        public string Rlid { get; }

        /// <summary>
        /// <see cref="Role"/> filter for members to return.
        /// </summary>
        /// <remarks>
        /// The result set will be filtered so that it includes
        /// only those memberships that contain this role. The value of the parameter
        /// should be the full URI for the role, although the simple name may be used for
        /// context-level roles. If omitted, the result set will include all members
        /// with any role.
        /// See https://www.imsglobal.org/spec/lti-nrps/v2p0#role-query-parameter.
        /// </remarks>
        public Role? Role { get; }
    }
}