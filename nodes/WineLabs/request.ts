import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';

export interface RequestPlan {
	options: IHttpRequestOptions;
	rpc: boolean;
	binaryProperty?: string;
}

function required(p: IDataObject, key: string): string {
	const value = String(p[key] ?? '').trim();
	if (!value) throw new Error(`${key} is required`);
	return value;
}

function bounded(p: IDataObject, key: string, fallback: number, min: number, max: number): number {
	const value = Number(p[key] ?? fallback);
	if (!Number.isInteger(value) || value < min || value > max)
		throw new Error(`${key} must be an integer between ${min} and ${max}`);
	return value;
}

function pick(p: IDataObject, keys: string[]): IDataObject {
	return Object.fromEntries(
		keys
			.filter((key) => p[key] !== '' && p[key] !== undefined && p[key] !== null)
			.map((key) => [key, p[key]]),
	);
}

function enumValue(p: IDataObject, key: string, allowed: string[], fallback: string): string {
	const value = String(p[key] ?? fallback);
	if (!allowed.includes(value)) throw new Error(`Invalid ${key}`);
	return value;
}

export function buildRequest(
	base: string,
	operation: string,
	p: IDataObject,
	credentials: IDataObject = {},
): RequestPlan {
	const options: IHttpRequestOptions = {
		method: 'POST',
		url: base,
		json: true,
		timeout: 120000,
		disableFollowRedirect: true,
		headers: { Accept: 'application/json' },
	};
	const plan: RequestPlan = { options, rpc: false };
	const body: IDataObject = {};
	{
		const routes: Record<string, string> = {
			match: '/match_to_lwin',
			matchBatch: '/match_to_lwin_batch',
			wineInfo: '/wine_info',
			priceStats: '/price_stats',
			historicalPriceStats: '/historical_price_stats',
			listings: '/listings',
			auctions: '/auctions',
			commodityCodes: '/commodity_codes',
			usage: '/usage',
		};
		if (!routes[operation]) throw new Error('Unknown Wine Labs operation');
		options.url += routes[operation];
		const userId = String(credentials.userId ?? '').trim();
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId))
			throw new Error('Configure a valid Wine Labs account UUID');
		if (operation === 'usage') {
			options.method = 'GET';
			options.qs = { user_id: userId };
			return plan;
		}
		body[
			operation === 'match' || operation === 'matchBatch' || operation === 'commodityCodes'
				? 'userId'
				: 'user_id'
		] = userId;
		if (operation === 'matchBatch') {
			const queries = required(p, 'queries')
				.split(/\r?\n/)
				.map((q) => q.trim())
				.filter(Boolean);
			if (!queries.length || queries.length > 100)
				throw new Error('Provide between 1 and 100 wine names');
			body.queries = queries;
		} else {
			const key = enumValue(p, 'identifierType', ['query', 'lwin', 'wl_id'], 'query');
			body[operation === 'commodityCodes' && key === 'wl_id' ? 'wlId' : key] = required(
				p,
				'identifier',
			);
		}
		if (['match', 'matchBatch', 'priceStats', 'historicalPriceStats'].includes(operation))
			body.mode = enumValue(p, 'mode', ['strict', 'fuzzy'], 'strict');
		if (operation === 'wineInfo')
			body.include_available_vintages = Boolean(p.includeAvailableVintages);
		if (
			['priceStats', 'historicalPriceStats', 'listings', 'auctions', 'commodityCodes'].includes(
				operation,
			)
		)
			Object.assign(body, pick(p, ['vintage']));
		if (['priceStats', 'historicalPriceStats', 'listings', 'auctions'].includes(operation)) {
			const currency = String(p.currency ?? 'USD').toUpperCase();
			if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be an ISO 4217 code');
			body.currency = currency;
		}
		if (operation === 'listings') body.only_trusted_merchants = p.onlyTrustedMerchants !== false;
		if (['listings', 'auctions'].includes(operation)) {
			body.limit = bounded(p, 'limit', 20, 1, 100);
			body.offset = bounded(p, 'offset', 0, 0, 1000000);
		}
		if (operation === 'commodityCodes' && p.destinationCountry)
			body.destinationCountry = p.destinationCountry;
	}
	options.body = body;
	return plan;
}

export function unwrapResponse(response: unknown, rpc: boolean): IDataObject {
	if (!rpc)
		return Array.isArray(response)
			? { results: response }
			: response && typeof response === 'object'
				? (response as IDataObject)
				: { data: response as string };
	const envelope = response as {
		error?: { message?: string };
		result?: {
			isError?: boolean;
			structuredContent?: IDataObject;
			content?: Array<{ type: string; text?: string }>;
		};
	};
	if (envelope.error) throw new Error(envelope.error.message || 'Remote procedure call failed');
	if (!envelope.result) throw new Error('The API returned an invalid MCP response');
	const result = envelope.result;
	const text = (result.content ?? [])
		.filter((c) => c.type === 'text')
		.map((c) => c.text ?? '')
		.join('\n');
	if (result.isError) throw new Error(text || 'The API tool failed');
	if (result.structuredContent) return result.structuredContent;
	try {
		const parsed: unknown = JSON.parse(text);
		return Array.isArray(parsed)
			? { results: parsed }
			: parsed && typeof parsed === 'object'
				? (parsed as IDataObject)
				: { data: parsed as string };
	} catch {
		return { text };
	}
}
