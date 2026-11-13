import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { properties } from './properties';
import { buildRequest, unwrapResponse } from './request';

export class WineLabs implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wine Labs',
		name: 'wineLabs',
		icon: { light: 'file:wine-labs.svg', dark: 'file:wine-labs.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Match wines, retrieve merchant offers, and look up wine market data',
		defaults: { name: 'Wine Labs' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'wineLabsApi', required: true }],
		properties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const output: INodeExecutionData[] = [];
		const credentials: IDataObject = await this.getCredentials('wineLabsApi');
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				const params: IDataObject = {};
				for (const property of properties) {
					const operations = property.displayOptions?.show?.operation;
					if (property.name !== 'operation' && (!operations || operations.includes(operation)))
						params[property.name] = this.getNodeParameter(
							property.name,
							itemIndex,
							property.default,
						) as IDataObject[string];
				}
				const plan = buildRequest(
					'https://external-api.wine-labs.com',
					operation,
					params,
					credentials,
				);
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'wineLabsApi',
					plan.options,
				);
				output.push({ json: unwrapResponse(response, plan.rpc), pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail())
					output.push({ json: { error: error.message }, pairedItem: { item: itemIndex } });
				else throw new NodeOperationError(this.getNode(), error, { itemIndex });
			}
		}
		return [output];
	}
}
