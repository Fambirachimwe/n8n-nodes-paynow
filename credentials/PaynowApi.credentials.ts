import type {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class PaynowApi implements ICredentialType {
    name = 'paynowApi';
    displayName = 'Paynow API';
    documentationUrl = 'https://paynow.co.zw/';
    properties: INodeProperties[] = [
        {
            displayName: 'Intergration ID',
            name: 'intergrationId',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            description: 'The intergration ID for the Paynow API',
        },
        {
            displayName: 'Integration Key',
            name: 'integrationKey',
            type: 'string',
            typeOptions: { password: true },
            default: '',
            description: 'The integration key for the Paynow API',
        }
    ];

}