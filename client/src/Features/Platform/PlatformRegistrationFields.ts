import { Platform } from '../../Models/Platform.model';

export type field = {
  fieldLabel: string;
  helpText?: string;
  isRequired?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  isCopyable?: boolean;
  fieldName: keyof Platform;
};

const platformSettingsFields: field[] = [
  {
    fieldLabel: 'Display Name',
    helpText: 'The display name of the tool in the backend. For debug purposes.',
    fieldName: 'displayName',
    isRequired: true
  },
  {
    fieldLabel: 'Issuer',
    helpText: 'This is the Issuer for all messages that originate from the Platform.',
    fieldName: 'issuer',
    isRequired: true
  },
  {
    fieldLabel: 'JWK Set URL',
    helpText: "The tool can retrieve the platform's public keys using this endpoint.",
    fieldName: 'jwkSetUrl',
    isRequired: true
  },
  {
    fieldLabel: 'Access Token URL',
    helpText:
      'The tool can request an access token using this endpoint (for example to use the Names and Role Service).',
    fieldName: 'accessTokenUrl',
    isRequired: true
  },
  {
    fieldLabel: 'Authorization URL',
    helpText: 'The tool requests the identity token from this endpoint.',
    fieldName: 'authorizationUrl',
    isRequired: true
  }
];

const toolSettingsFields: field[] = [
  {
    fieldLabel: 'Login URL',
    fieldName: 'loginUrl',
    helpText: "The URL to initiate the tool's OpenID Connect third party login.",
    disabled: true,
    isCopyable: true
  },
  {
    fieldLabel: 'Launch URL',
    fieldName: 'launchUrl',
    helpText: "The URL to launch the tool's resource link experience.",
    disabled: true,
    isCopyable: true
  },
  {
    fieldLabel: 'Client ID',
    fieldName: 'clientId',
    helpText: 'The client ID which is provided by the LMS for this specific registration.',
    isRequired: true,
    isCopyable: false
  },
  {
    fieldLabel: 'Public Key',
    fieldName: 'publicKey',
    helpText: 'The public part of the RSA key to allow LMS to validate the messages that are sent by the tool.',
    disabled: true,
    isCopyable: true,
    multiline: true
  },
  {
    fieldLabel: 'Public JWK',
    fieldName: 'toolJwk',
    helpText: 'The Json Web Key (JWK) representation of the Public Key to allow LMS to validate the messages that are sent by the tool.',
    disabled: true,
    isCopyable: true,
    multiline: true
  },
  {
    fieldLabel: 'Public JWK Set URL',
    fieldName: 'toolJwkSetUrl',
    helpText: 'The URL providing the Json Web Key Set(JWKS) to allow LMS to validate the messages that are sent by the tool',
    disabled: true,
    isCopyable: true,
    multiline: false
  }
];

const personalizationFields: field[] = [
  {
    fieldLabel: 'Institution Name',
    fieldName: 'institutionName',
    helpText: 'The name of the institution which will be displayed to the users.',
    isRequired: false
  },
  {
    fieldLabel: 'Logo URL',
    fieldName: 'logoUrl',
    helpText: 'The logo that will be displayed to the users.',
    isRequired: false
  }
];

type fieldsGroup = {
  name: string;
  fields: field[];
};

export const platformRegistrationFieldGroups: fieldsGroup[] = [
  {
    name: 'Platform Settings',
    fields: platformSettingsFields
  },
  {
    name: 'Tool Settings',
    fields: toolSettingsFields
  },
  {
    name: 'Personalization',
    fields: personalizationFields
  }
];
