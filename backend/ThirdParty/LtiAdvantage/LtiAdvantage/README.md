# LtiAdvantage

LtiAdvantage is a library to ease the work of creating an LTI Advantage platform or tool. This version supports

- [LTI Core Specification v1.3](https://www.imsglobal.org/spec/lti/v1p3/)
- LTI Advantage Specifications
  - [Names and Role Provisioning Services v2.0](https://www.imsglobal.org/spec/lti-nrps/v2p0)
- [IMS Security Framework v1.0](https://www.imsglobal.org/spec/security/v1p0/)

## ASP.NET Core

This library targets `netstandard2.0` and uses BouncyCastle.NetCore to read and write PEM formatted keys
for compatibility with the [IMS LTI Reference Implementation](https://github.com/IMSGlobal/lti-reference-implementation).

## Getting Started

There are two sample applications you can reference for ideas:
- [Sample Tool](https://github.com/andyfmiller/LtiAdvantageTool)
- [Sample Platform](https://github.com/andyfmiller/LtiAdvantagePlatform)
