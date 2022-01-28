[![GitHub license](https://img.shields.io/github/license/microsoft/Learn-LTI.svg)](https://github.com/microsoft/Learn-LTI/blob/master/LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/microsoft/Learn-LTI.svg)](https://GitHub.com/microsoft/Learn-LTI/graphs/contributors/)
[![GitHub issues](https://img.shields.io/github/issues/microsoft/Learn-LTI.svg)](https://GitHub.com/microsoft/Learn-LTI/issues/)
[![GitHub pull-requests](https://img.shields.io/github/issues-pr/microsoft/Learn-LTI.svg)](https://GitHub.com/microsoft/Learn-LTI/pull/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

[![GitHub watchers](https://img.shields.io/github/watchers/microsoft/Learn-LTI.svg?style=social&label=Watch&maxAge=2592000)](https://GitHub.com/microsoft/Learn-LTI/watchers/)
[![GitHub forks](https://img.shields.io/github/forks/microsoft/Learn-LTI.svg?style=social&label=Fork&maxAge=2592000)](https://GitHub.com/microsoft/Learn-LTI/network/)
[![GitHub stars](https://img.shields.io/github/stars/microsoft/Learn-LTI.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/microsoft/LEARN-LTI/stargazers/)

# Microsoft Learn LTI Application 

![Learn LTI Application](/images/Learn-lti.png)
### About ###
[Microsoft Learn](https://docs.microsoft.com/learn/?WT.mc_id=edna) is a free, online training platform that provides interactive learning resources for Microsoft products and cutting edge technologies. Our goal is to empower students and educators to learn about technology through fun, guided, hands-on content aimed at specific learning goals. 

To bring Microsoft Learn's content into the classroom, we've made a Learning Tools Interoperability (LTI) application that enables you to seamlessly blend self-paced learning content from the Microsoft Learn catalog with your curriculum and Learning Management System (LMS).

Educators and Institutions can leverage the LTI application to integrate Microsoft Learn Modules and Learning Paths into their curricula while providing hands-on experiences with Azure and other Microsoft technologies. Learners will be routed from their LMS to Microsoft Learn, where they can accrue experience points and achievements as well as track progress on learning activities.

The Microsoft Learn LTI Application adheres to [v1.1](https://www.imsglobal.org/specs/ltiv1p1) and [v1.3](http://www.imsglobal.org/spec/lti/v1p3/) standards. For more specifics on the application itself, check out the [Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md).

### Key Features: ###
- **Single Sign-On** (SSO) - users only have to sign into their institution once to access the Learn LTI application
- **LMS Pairing** - instructors can create, edit, and publish Learn-based assignments for their courses and populate their insitution's LMS with them easily
- **LTI v1.1 and v1.3 Compliant** - student data is not gathered and their data cannot be accessed; all user data is protected.

### What do I need to get started? ###
Typically, there will be four roles involved in deploying, configuring, and using the Microsoft Learn LTI application with Institution’s LMS.

1. **Central IT / IT Admin** – The user deploying the Microsoft Learn LTI application to Azure. They need to be an owner of an Azure subscription and have the privileges to create Azure resources. This person will also be the one configuring the Microsoft Learn LTI application to work with the LMS.
2. **LMS Admin** – The user configuring the LMS to work with the deployed Microsoft Learn LTI application. Once configured, the Microsoft Learn LTI application will appear as an LTI tool (external tool) to be used by all Educators on the LMS.
3. **Educators** – The user(s) of the LMS who is set up as a “Teacher” in a course and will facilitate the learning. This person will create activities or resources based on the configured LTI tool on the LMS.
4. **Students** – The users of the LMS who will consume the learning provisioned to them by the Educators.

The following visual illustrates the workflow in full:
![Readme.1.png](./images/Readme.1.png)

To deploy the Microsoft Learn LTI application, the Central IT / IT Admin will need:

- LMS System that supports LTI v1.1 or v1.3
- You need to be the **owner** of an Azure subscription if your an educator please contact your Institutional IT Department.
- IT administrator privileges to create an Azure resource
- [Getting Started Overview](https://techcommunity.microsoft.com/t5/educator-developer-blog/getting-started-with-the-microsoft-learn-lti-application/ba-p/2247034)
- Microsoft Learn LTI application [Setup presentation](./docs/Microsoft%20Learn%20LTI%20Application.pdf) 

# Table of Contents

## Deployment Guides 
- [Setting up Dev Test Environment setup](./docs/DEVTESTENV.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Configuration Guide](./docs/CONFIGURATION_GUIDE.md)

## User Guides
- [Educator Setting up a course guide](./docs/USER_GUIDE.md)
- [Student Guide](./docs/STUDENT_GUIDE.md)

## Overview Guides 
- [Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md)
- [Pricing Structure](./docs/PRICING_STRUCTURE.md)
- [Open Source Contributions](./docs/TAKE_IT_FURTHER.md)

## Troubleshooting 
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Frequently Asked Questions](./docs/FAQ.md)
- [Using ZTest Tooling](./docs/ZTEST.md)

## Security and Privacy
- [Security Guide](./docs/SECURITY.md)
- [Privacy Guide](./docs/PRIVACY.md)
- [VPAT Guide](./docs/VPAT.MD)
- [Using ZTest Tooling](./docs/ZTEST.md)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/?WT.mc_id=learnlti-github-cxa).
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/?WT.mc_id=learnlti-github-cxa) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
