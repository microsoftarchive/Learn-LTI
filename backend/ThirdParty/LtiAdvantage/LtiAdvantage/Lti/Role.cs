using LtiAdvantage.Utilities;
using Newtonsoft.Json;

namespace LtiAdvantage.Lti
{
    /// <summary>
    /// The role of the user within a given context.
    /// </summary>
    [JsonConverter(typeof(RoleConverter))]
    public enum Role
    {
        /// <summary>
        /// </summary>
        Unknown = 0,

        #region Core Context Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Administrator")]
        [Uri("Administrator")]
        ContextAdministrator,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper")]
        [Uri("ContentDeveloper")]
        ContextContentDeveloper,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor")]
        [Uri("Instructor")]
        ContextInstructor,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Learner")]
        [Uri("Learner")]
        ContextLearner,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor")]
        [Uri("Mentor")]
        ContextMentor,

        #endregion

        #region Non-Core Context Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Manager")]
        [Uri("Manager")]
        ContextManager,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Member")]
        [Uri("Member")]
        ContextMember,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/membership#Officer")]
        [Uri("Officer")]
        ContextOfficer,

        #endregion

        #region Core Institution Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator")]
        InstitutionAdministrator,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Guest")]
        InstitutionGuest,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#None")]
        InstitutionNone,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Other")]
        InstitutionOther,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Staff")]
        InstitutionStaff,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student")]
        InstitutionStudent,

        #endregion

        #region Non-Core Institution Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Alumni")]
        InstitutionAlumni,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Faculty")]
        InstitutionFaculty,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor")]
        InstitutionInstructor,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Learner")]
        InstitutionLearner,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Member")]
        InstitutionMember,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Mentor")]
        InstitutionMentor,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#Observer")]
        InstitutionObserver,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/institution/person#ProspectiveStudent")]
        InstitutionProspectiveStudent,

        #endregion

        #region Core System Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#Administrator")]
        SystemAdministrator,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#None")]
        SystemNone,

        #endregion

        #region Non-Core System Roles

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#AccountAdmin")]
        SystemAccountAdmin,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#Creator")]
        SystemCreator,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin")]
        SystemSysAdmin,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#SysSupport")]
        SystemSysSupport,

        /// <summary>
        /// </summary>
        [Uri("http://purl.imsglobal.org/vocab/lis/v2/system/person#User")]
        SystemUser,

        #endregion
    }
}