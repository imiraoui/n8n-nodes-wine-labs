const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
	buildRequest,
	unwrapResponse,
	multipartDocument,
} = require('../dist/nodes/WineLabs/request');
const { WineLabs } = require('../dist/nodes/WineLabs/WineLabs.node');
const { properties } = require('../dist/nodes/WineLabs/properties');
const base = 'https://external-api.wine-labs.com';
const uuid = '00000000-0000-4000-8000-000000000001';
const creds = { userId: uuid, apiKey: 'test-secret', baseUrl: 'https://mailreveal.example' };
const defaults = {
	identifier: 'Chateau Margaux 2015',
	identifierType: 'query',
	queries: 'Chateau Margaux 2015\nChateau Latour 2010',
	url: 'https://example.com/document.pdf',
	binaryProperty: 'data',
	query: 'security deposit',
	slug: 'security-deposit',
	area: 'chelsea',
	bedrooms: '0',
	q: '117 Henry Street',
	bbl: '1002830005',
	sections: ['comps'],
	messageId: uuid,
	recipient: 'recipient@example.com',
	subject: 'Example',
	body: 'Example body',
	idempotencyKey: 'test-123',
	confirmed: true,
};
const service = 'wine-labs';

test('every advertised operation builds a bounded request to its service', () => {
	const operations = properties.find((p) => p.name === 'operation').options;
	for (const operation of operations) {
		const plan = buildRequest(base, operation.value, defaults, creds);
		assert.ok(
			plan.options.url.startsWith(
				service === 'mailreveal' ? 'https://mailreveal.example/api/v1' : base,
			),
		);
		assert.ok(plan.options.timeout > 0);
		assert.equal(plan.options.disableFollowRedirect, true);
		assert.ok(!JSON.stringify(plan).includes('test-secret'));
		if (plan.options.method === 'GET') assert.equal(plan.options.body, undefined);
	}
	assert.throws(() => buildRequest(base, 'unknown', defaults, creds), /Unknown/);
});

test('one result per input retains paired item indexes and uses the authenticated helper when needed', async () => {
	const requests = [];
	const auth = [];
	const operation = 'match';
	const parameters = {
		...Object.fromEntries(properties.map((p) => [p.name, p.default])),
		...defaults,
		operation,
	};
	const context = {
		getInputData: () => [{ json: { input: 1 } }, { json: { input: 2 } }],
		getNodeParameter: (key, index, fallback) => parameters[key] ?? fallback,
		getCredentials: async (name) => {
			auth.push(name);
			return creds;
		},
		continueOnFail: () => false,
		getNode: () => ({
			name: 'Test',
			type: 'test',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		}),
		helpers: {
			httpRequest: async (options) => {
				requests.push(options);
				return reply();
			},
			httpRequestWithAuthentication: async function (name, options) {
				auth.push(name);
				requests.push(options);
				return reply();
			},
		},
	};
	const [out] = await new WineLabs().execute.call(context);
	assert.equal(requests.length, 2);
	assert.equal(out.length, 2);
	assert.deepEqual(
		out.map((item) => item.pairedItem),
		[{ item: 0 }, { item: 1 }],
	);
	assert.equal(auth.length, true ? 3 : 0);
});

function reply() {
	return ['rentreboot', 'curbscoop'].includes(service)
		? { jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: '{"ok":true}' }] } }
		: { ok: true };
}

test('continue-on-fail retains failed item indexes and does not mutate input', async () => {
	const input = [{ json: { source: 1 } }];
	const context = {
		getInputData: () => input,
		getNodeParameter: () => {
			throw new Error('invalid parameter');
		},
		getCredentials: async () => creds,
		continueOnFail: () => true,
	};
	const [out] = await new WineLabs().execute.call(context);
	assert.deepEqual(out, [{ json: { error: 'invalid parameter' }, pairedItem: { item: 0 } }]);
	assert.deepEqual(input, [{ json: { source: 1 } }]);
});

test('response normalization preserves source data, arrays and remote errors', () => {
	const evidence = { currency: 'EUR', source: 'https://example.com/evidence', confidence: 'low' };
	assert.deepEqual(unwrapResponse(evidence, false), evidence);
	assert.deepEqual(unwrapResponse([evidence], false), { results: [evidence] });
	assert.deepEqual(
		unwrapResponse({ result: { structuredContent: evidence, content: [] } }, true),
		evidence,
	);
	assert.deepEqual(
		unwrapResponse(
			{ result: { content: [{ type: 'text', text: JSON.stringify([evidence]) }] } },
			true,
		),
		{ results: [evidence] },
	);
	assert.throws(
		() => unwrapResponse({ error: { message: 'quota exceeded' } }, true),
		/quota exceeded/,
	);
	assert.throws(
		() =>
			unwrapResponse(
				{ result: { isError: true, content: [{ type: 'text', text: 'not available' }] } },
				true,
			),
		/not available/,
	);
	assert.throws(() => unwrapResponse({}, true), /invalid MCP response/);
});

test('examples contain no selected credentials, active workflows, or fabricated results', () => {
	for (const filename of ['basic', 'ai-agent-tool']) {
		const workflow = require('../examples/' + filename + '.json');
		assert.equal(workflow.active, false);
		assert.deepEqual(workflow.pinData, {});
		assert.ok(workflow.nodes.every((node) => !node.credentials));
	}
});

test('Wine Labs applies the documented identity aliases and preserves matching mode', () => {
	assert.equal(buildRequest(base, 'match', defaults, creds).options.body.userId, uuid);
	assert.equal(buildRequest(base, 'wineInfo', defaults, creds).options.body.user_id, uuid);
	assert.deepEqual(buildRequest(base, 'usage', defaults, creds).options.qs, { user_id: uuid });
	const plan = buildRequest(base, 'matchBatch', { ...defaults, mode: 'fuzzy' }, creds);
	assert.deepEqual(plan.options.body.queries, ['Chateau Margaux 2015', 'Chateau Latour 2010']);
	assert.equal(plan.options.body.mode, 'fuzzy');
	assert.equal(
		buildRequest(base, 'listings', defaults, creds).options.body.only_trusted_merchants,
		true,
	);
	assert.throws(() => buildRequest(base, 'match', defaults, {}), /UUID/);
	assert.throws(
		() =>
			buildRequest(
				base,
				'matchBatch',
				{ ...defaults, queries: Array(101).fill('wine').join('\n') },
				creds,
			),
		/100/,
	);
	assert.throws(() => buildRequest(base, 'listings', { ...defaults, limit: 101 }, creds), /limit/);
});

test('Wine Labs bodies use only published request fields, including commodity aliases', () => {
	const contract = require('./api-field-contract.json');
	for (const [operation, fields] of Object.entries(contract)) {
		const { options } = buildRequest(
			base,
			operation,
			{ ...defaults, identifierType: 'wl_id', vintage: '2015', destinationCountry: 'US' },
			creds,
		);
		for (const key of Object.keys(options.body))
			assert.ok(fields.includes(key), operation + ': unknown field ' + key);
	}
	const commodity = buildRequest(
		base,
		'commodityCodes',
		{ ...defaults, identifierType: 'wl_id' },
		creds,
	).options.body;
	assert.equal(commodity.userId, uuid);
	assert.ok(commodity.wlId);
});
