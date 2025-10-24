"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paynow = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
const paynow_1 = require("paynow");
class Paynow {
    constructor() {
        this.description = {
            displayName: 'Paynow',
            name: 'paynow',
            icon: { light: 'file:paynow.logo.svg', dark: 'file:paynow.logo.svg' },
            group: ['input'],
            version: 1,
            description: 'Paynow Node',
            defaults: {
                name: 'Paynow',
            },
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                {
                    name: 'paynowApi',
                    required: true,
                },
            ],
            usableAsTool: true,
            properties: [
                {
                    displayName: 'Phone Number',
                    name: 'phoneNumber',
                    type: 'string',
                    default: '',
                    placeholder: 'Phone Number',
                    description: 'The phone number for the Paynow API',
                },
                {
                    displayName: 'Amount',
                    name: 'amount',
                    type: 'number',
                    default: 0,
                    placeholder: 'Amount',
                    description: 'The amount for the Paynow API',
                },
                {
                    displayName: 'Currency',
                    name: 'currency',
                    type: 'options',
                    default: 'ZWL',
                    noDataExpression: true,
                    options: [
                        {
                            displayName: 'ZWL',
                            name: 'ZWL',
                            value: 'ZWL',
                            description: 'Zimbabwean Dollar',
                        },
                        {
                            displayName: 'USD',
                            name: 'USD',
                            value: 'USD',
                            description: 'United States Dollar',
                        },
                    ],
                },
                {
                    displayName: 'Method',
                    name: 'method',
                    type: 'options',
                    default: 'ecocash',
                    noDataExpression: true,
                    options: [
                        {
                            displayName: 'Ecocash',
                            name: 'ecocash',
                            value: 'ecocash',
                            description: 'Ecocash',
                        },
                        {
                            displayName: 'Onemoney',
                            name: 'onemoney',
                            value: 'onemoney',
                            description: 'Onemoney',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const credentials = await this.getCredentials('paynowApi');
        let item;
        let phoneNumber;
        let amount;
        let method;
        const paynow = new paynow_1.Paynow(credentials.intergrationId, credentials.integrationKey);
        paynow.resultUrl = "http://example.com/gateways/paynow/update";
        paynow.returnUrl = "http://example.com/return?gateway=paynow&merchantReference=1234";
        const checkPaymentStatus = async (polURL) => {
            try {
                const response = await (0, node_fetch_1.default)(polURL);
                const text = await response.text();
                const decoded = decodeURIComponent(text.replace(/&amp;/g, "&"));
                const params = new URLSearchParams(decoded);
                const status = params.get("status");
                console.log(`Current status: ${status}`);
                return status;
            }
            catch (error) {
                console.log(error);
                return null;
            }
        };
        const pollPayment = async (interval = 5000, polURL, timeout = 120000) => {
            console.log("Checking Paynow status...");
            let polStatus = null;
            const start = Date.now();
            while (Date.now() - start < timeout) {
                polStatus = await checkPaymentStatus(polURL);
                if (!polStatus)
                    break;
                if (["Paid", "Cancelled", "Failed"].includes(polStatus)) {
                    console.log(`Payment completed with status: ${polStatus}`);
                    break;
                }
                console.log("Waiting 5 seconds before next check...");
                await new Promise(resolve => setTimeout(resolve, interval));
            }
            return polStatus || "Timeout";
        };
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '');
                amount = this.getNodeParameter('amount', itemIndex, 0);
                method = this.getNodeParameter('method', itemIndex, 'ecocash');
                item = items[itemIndex];
                item.json.phoneNumber = phoneNumber;
                item.json.amount = amount;
                const payment = paynow.createPayment("Invoice 35");
                payment.add("items", amount);
                payment.authEmail = "t.svaku@gmail.com";
                const response = await paynow.sendMobile(payment, phoneNumber, method);
                item.json.response = response;
                item.json.payment = payment;
                const pollStatus = await pollPayment(5000, response.pollUrl);
                console.log('pollStatus', pollStatus);
                console.log("response", response);
                if (pollStatus) {
                    item.json.pollStatus = pollStatus;
                    response.status = "ok";
                    item.json.response = response;
                }
                else {
                    item.json.pollStatus = "Failed";
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
                }
                else {
                    if (error.context) {
                        error.context.itemIndex = itemIndex;
                        throw error;
                    }
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error, {
                        itemIndex,
                    });
                }
            }
        }
        return [items];
    }
}
exports.Paynow = Paynow;
//# sourceMappingURL=Paynow.node.js.map