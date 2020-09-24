// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Threading.Tasks;
using Edna.Bindings.Assignment.Attributes;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Config;
using Microsoft.Extensions.Logging;

namespace Edna.Bindings.Assignment
{
    public class AssignmentExtensionConfigProvider : IExtensionConfigProvider
    {
        private readonly AssignmentsCollector.Converter _assignmentsCollectorConverter;
        private readonly AssignmentsClient.Factory _assignmentClientFactory;

        public AssignmentExtensionConfigProvider(AssignmentsCollector.Converter assignmentsCollectorConverter, AssignmentsClient.Factory assignmentClientFactory)
        {
            _assignmentsCollectorConverter = assignmentsCollectorConverter;
            _assignmentClientFactory = assignmentClientFactory;
        }

        public void Initialize(ExtensionConfigContext context)
        {
            var assignmentBinding = context.AddBindingRule<AssignmentAttribute>();

            assignmentBinding.BindToCollector(_assignmentsCollectorConverter);
            assignmentBinding.BindToInput(ConvertToAssignment);
        }

        private Task<Models.Assignment> ConvertToAssignment(AssignmentAttribute attribute, ValueBindingContext context)
        {
            string baseServiceUriString = Environment.GetEnvironmentVariable(attribute.ServiceUrlEnvironmentVariable);
            if (string.IsNullOrEmpty(baseServiceUriString))
                throw new ArgumentException("Assignment service URL was not provided.");

            AssignmentsClient assignmentsClient = _assignmentClientFactory.CreateClient(baseServiceUriString);
            return assignmentsClient.GetAssignment(attribute.AssignmentId);
        }
    }
}