// --------------------------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// --------------------------------------------------------------------------------------------

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Edna.Bindings.Assignment.Attributes;
using Edna.Utils.Http;
using Edna.Utils.Linq;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace Edna.Bindings.Assignment
{
    public class AssignmentsCollector : IAsyncCollector<Models.Assignment>
    {
        private readonly AssignmentsClient _client;
        private readonly List<Models.Assignment> _assignmentsToSave = new List<Models.Assignment>();

        public class Converter : IConverter<AssignmentAttribute, IAsyncCollector<Models.Assignment>>
        {
            private readonly AssignmentsClient.Factory _assignmentClientFactory;

            public Converter(AssignmentsClient.Factory assignmentClientFactory)
            {
                _assignmentClientFactory = assignmentClientFactory;
            }

            public IAsyncCollector<Models.Assignment> Convert(AssignmentAttribute attribute)
            {
                string baseServiceUriString = Environment.GetEnvironmentVariable(attribute.ServiceUrlEnvironmentVariable);
                if (string.IsNullOrEmpty(baseServiceUriString))
                    throw new ArgumentException("Assignment service URL was not provided.");

                AssignmentsClient assignmentsClient = _assignmentClientFactory.CreateClient(baseServiceUriString);

                return new AssignmentsCollector(assignmentsClient);
            }
        }

        private AssignmentsCollector(AssignmentsClient client)
        {
            _client = client;
        }

        public Task AddAsync(Models.Assignment item, CancellationToken cancellationToken = new CancellationToken())
        {
            _assignmentsToSave.Add(item);
            return Task.CompletedTask;
        }

        public async Task FlushAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            await _assignmentsToSave
                .Select(assignment => _client.SaveAssignment(assignment))
                .WhenAll();

            _assignmentsToSave.Clear();
        }
    }
}