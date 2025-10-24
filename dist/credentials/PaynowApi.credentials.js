"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaynowApi = void 0;
class PaynowApi {
    constructor() {
        this.name = 'paynowApi';
        this.displayName = 'Paynow API';
        this.documentationUrl = 'https://paynow.co.zw/';
        this.properties = [
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
}
exports.PaynowApi = PaynowApi;
//# sourceMappingURL=PaynowApi.credentials.js.map