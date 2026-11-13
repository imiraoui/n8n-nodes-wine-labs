import type { INodeProperties } from 'n8n-workflow';

export const properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				value: 'auctions',
				name: 'Get Auctions',
				action: 'Get wine auctions',
				description: 'Get auction results for a wine',
			},
			{
				value: 'commodityCodes',
				name: 'Get Commodity Codes',
				action: 'Get wine commodity codes',
				description: 'Look up commodity classification data',
			},
			{
				value: 'historicalPriceStats',
				name: 'Get Historical Price Statistics',
				action: 'Get historical price statistics',
				description: 'Get historical market price statistics',
			},
			{
				value: 'listings',
				name: 'Get Listings',
				action: 'Get wine listings',
				description: 'Get merchant offers for a wine',
			},
			{
				value: 'priceStats',
				name: 'Get Price Statistics',
				action: 'Get price statistics',
				description: 'Get current market price statistics',
			},
			{
				value: 'usage',
				name: 'Get Usage',
				action: 'Get API usage',
				description: 'Get account API usage',
			},
			{
				value: 'wineInfo',
				name: 'Get Wine',
				action: 'Get a wine',
				description: 'Get wine metadata and identifiers',
			},
			{
				value: 'match',
				name: 'Match',
				action: 'Match a wine',
				description: 'Match a wine name to LWIN and Wine Labs identifiers',
			},
			{
				value: 'matchBatch',
				name: 'Match Batch',
				action: 'Match a batch of wines',
				description: 'Match up to 100 wine names',
			},
		],
		default: 'match',
	},
	{
		displayName: 'Identify By',
		name: 'identifierType',
		type: 'options',
		default: 'query',
		options: [
			{
				name: 'LWIN',
				value: 'lwin',
			},
			{
				name: 'Wine Labs ID',
				value: 'wl_id',
			},
			{
				name: 'Wine Name',
				value: 'query',
			},
		],
		displayOptions: {
			show: {
				operation: [
					'match',
					'wineInfo',
					'priceStats',
					'historicalPriceStats',
					'listings',
					'auctions',
					'commodityCodes',
				],
			},
		},
	},
	{
		displayName: 'Wine Identifier',
		name: 'identifier',
		type: 'string',
		default: '',
		description: 'Wine name, LWIN, or Wine Labs ID matching Identify By',
		displayOptions: {
			show: {
				operation: [
					'match',
					'wineInfo',
					'priceStats',
					'historicalPriceStats',
					'listings',
					'auctions',
					'commodityCodes',
				],
			},
		},
		required: true,
		placeholder: 'Chateau Margaux 2015',
	},
	{
		displayName: 'Wine Names',
		name: 'queries',
		type: 'string',
		default: '',
		description: 'One wine name per line; up to 100 names',
		displayOptions: {
			show: {
				operation: ['matchBatch'],
			},
		},
		required: true,
		typeOptions: {
			rows: 5,
		},
		placeholder: 'Chateau Margaux 2015',
	},
	{
		displayName: 'Matching Mode',
		name: 'mode',
		type: 'options',
		default: 'strict',
		options: [
			{
				name: 'Fuzzy',
				value: 'fuzzy',
			},
			{
				name: 'Strict',
				value: 'strict',
			},
		],
		displayOptions: {
			show: {
				operation: ['match', 'matchBatch', 'priceStats', 'historicalPriceStats'],
			},
		},
	},
	{
		displayName: 'Include Available Vintages',
		name: 'includeAvailableVintages',
		type: 'boolean',
		default: false,
		description: 'Whether to include available vintages',
		displayOptions: {
			show: {
				operation: ['wineInfo'],
			},
		},
	},
	{
		displayName: 'Vintage',
		name: 'vintage',
		type: 'string',
		default: '',
		description: 'Optional vintage year; leave empty to use the wine identifier',
		displayOptions: {
			show: {
				operation: ['priceStats', 'historicalPriceStats', 'listings', 'auctions', 'commodityCodes'],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		default: 'USD',
		description: 'ISO 4217 currency code, for example USD, EUR, or GBP',
		displayOptions: {
			show: {
				operation: ['priceStats', 'historicalPriceStats', 'listings', 'auctions'],
			},
		},
	},
	{
		displayName: 'Only Trusted Merchants',
		name: 'onlyTrustedMerchants',
		type: 'boolean',
		default: true,
		description: 'Whether to restrict offers to trusted merchants',
		displayOptions: {
			show: {
				operation: ['listings'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				operation: ['listings', 'auctions'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Number of results to skip',
		displayOptions: {
			show: {
				operation: ['listings', 'auctions'],
			},
		},
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Destination Country',
		name: 'destinationCountry',
		type: 'string',
		default: '',
		description: 'Optional destination country code',
		displayOptions: {
			show: {
				operation: ['commodityCodes'],
			},
		},
	},
];
