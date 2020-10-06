﻿using System;
using System.Net.Http;
using System.Threading.Tasks;
using Edna.Bindings.User.Attributes;
using LtiAdvantage.NamesRoleProvisioningService;
using Microsoft.Azure.WebJobs.Host.Bindings;
using Microsoft.Azure.WebJobs.Host.Config;
using Microsoft.Extensions.Logging;

namespace Edna.Bindings.User
{
    public class UserExtensionConfigProvider : IExtensionConfigProvider
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public UserExtensionConfigProvider(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public void Initialize(ExtensionConfigContext context)
        {
            var userBindingRule = context.AddBindingRule<UserAttribute>();

            userBindingRule.BindToInput(GetAllUsers);
            userBindingRule.BindToInput(attribute => new UsersClient(attribute.ServiceUrlEnvironmentVariable, _httpClientFactory));
        }

        private async Task<Models.User[]> GetAllUsers(UserAttribute userAttribute, ValueBindingContext context)
        {
            UsersClient usersClient = new UsersClient(userAttribute.ServiceUrlEnvironmentVariable, _httpClientFactory);
            return await usersClient.GetAllUsers(userAttribute.AssignmentId);
        }
    }
}