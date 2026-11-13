import type {
	IAuthenticateGeneric,
	ICredentialType,
	Icon,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class WineLabsApi implements ICredentialType {
	name = 'wineLabsApi';
	displayName = 'Wine Labs API';
	icon: Icon = { light: 'file:wine-labs.svg', dark: 'file:wine-labs.dark.svg' };
	documentationUrl = 'https://winelabs.ai/api/docs';
	properties: INodeProperties[] = [
		// eslint-disable-next-line @n8n/community-nodes/credential-unnecessary-password -- This account UUID authorizes access under the published API contract.
		{
			displayName: 'Account UUID',
			name: 'userId',
			type: 'string',
			default: '',
			description: 'Account identifier authorized for the Wine Labs APIs',
			typeOptions: {
				password: true,
			},
			required: true,
		},
		{
			displayName: 'Managed Bearer Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			description: 'Optional managed API bearer key, if supplied by Wine Labs',
			typeOptions: {
				password: true,
			},
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: { Authorization: '={{$credentials.apiKey ? "Bearer " + $credentials.apiKey : ""}}' },
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://external-api.wine-labs.com/usage',
			url: '',
			method: 'GET',
			qs: { user_id: '={{$credentials.userId}}' },
		},
	};
}
