import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

// @ts-expect-error No declaration file found
import { Paynow as PaynowConstructor } from 'paynow';




export class Paynow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Paynow',
		name: 'paynow',
		icon: { light: 'file:paynow.logo.svg', dark: 'file:paynow.logo.svg' },
		group: ['input'],
		version: 1,
		description: 'Paynow Node',
		defaults: {
			name: 'Paynow',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'paynowApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
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

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const credentials = await this.getCredentials('paynowApi') as {
			intergrationId: string;
			integrationKey: string;
		};

		// console.log('credentials', credentials);

		let item: INodeExecutionData;
		let phoneNumber: string;
		let amount: number;
		let method: string;
		const paynow = new PaynowConstructor(credentials.intergrationId, credentials.integrationKey);
		paynow.resultUrl = "http://example.com/gateways/paynow/update";
		paynow.returnUrl = "http://example.com/return?gateway=paynow&merchantReference=1234";

		const checkPaymentStatus = async (polURL: string) => {
			try {
				const response = await fetch(polURL);
				const text = await response.text();
				// Decode HTML entities (&amp;) and URL-encoded values
				const decoded = decodeURIComponent(text.replace(/&amp;/g, "&"));
				const params = new URLSearchParams(decoded);

				const status = params.get("status");
				console.log(`Current status: ${status}`);

				return status;

			} catch (error) {
				console.log(error);
				return null;
			}
		}

		const pollPayment = async (interval = 5000, polURL: string, timeout = 120000) => {
			console.log("Checking Paynow status...");
			let polStatus: string | null = null;
			const start = Date.now();

			while (Date.now() - start < timeout) {
				polStatus = await checkPaymentStatus(polURL);

				if (!polStatus) break;

				if (["Paid", "Cancelled", "Failed"].includes(polStatus)) {
					console.log(`Payment completed with status: ${polStatus}`);
					break;
				}

				console.log("Waiting 5 seconds before next check...");
				await new Promise(resolve => setTimeout(resolve, interval));
			}

			return polStatus || "Timeout";
		};






		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				phoneNumber = this.getNodeParameter('phoneNumber', itemIndex, '') as string;
				amount = this.getNodeParameter('amount', itemIndex, 0) as number;
				method = this.getNodeParameter('method', itemIndex, 'ecocash') as string;



				// console.log(phoneNumber, amount, method);
				item = items[itemIndex];

				item.json.phoneNumber = phoneNumber;
				item.json.amount = amount;

				const payment = paynow.createPayment("Invoice 35");
				payment.add("items", amount);
				payment.authEmail = "t.svaku@gmail.com";
				// console.log(payment);
				const response = await paynow.sendMobile(payment, phoneNumber, method);
				// console.log(JSON.stringify(response));
				item.json.response = response;
				item.json.payment = payment;


				//wait for the polURL to execute  

				const pollStatus = await pollPayment(5000, response.pollUrl);

				console.log('pollStatus', pollStatus);
				console.log("response", response);
				if (pollStatus) {
					item.json.pollStatus = pollStatus;
					response.status = "ok";
					item.json.response = response;
				} else {
					item.json.pollStatus = "Failed";
				}


			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		// console.log(items);

		return [items];
	}
}
