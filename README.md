# n8n-nodes-wine-labs

Use [Wine Labs](https://winelabs.ai) in [n8n](https://n8n.io). Match wines, retrieve merchant offers, and look up wine market data.

This is a community integration. n8n verification has not been granted. Publication metadata is pending an operator-approved public author email; `npm run lint` deliberately blocks release until that field is configured. CI runs source lint, build, and contract tests.

## Installation

After npm publication, self-hosted n8n users can install `n8n-nodes-wine-labs` under Settings → Community Nodes. Installation on n8n Cloud requires n8n verification.

## Credentials

Configure your authorized Wine Labs account UUID in the credential. A managed bearer key is optional when issued by Wine Labs. The account needs access to each API product used; the node follows the published account-ID contract. No shared server key is included.

## Operations

- **Match**: Match a wine name to LWIN and Wine Labs identifiers.
- **Match Batch**: Match up to 100 wine names.
- **Get Wine**: Get wine metadata and identifiers.
- **Get Price Statistics**: Get current market price statistics.
- **Get Historical Price Statistics**: Get historical market price statistics.
- **Get Listings**: Get merchant offers for a wine.
- **Get Auctions**: Get auction results for a wine.
- **Get Commodity Codes**: Look up commodity classification data.
- **Get Usage**: Get account API usage.

## Usage

Import `examples/basic.json`, select your credential if required, and run the workflow. Example document URLs are placeholders and must be replaced with a real public document you are authorized to process. Inputs and responses retain the service's identifiers, currencies, source evidence, and uncertainty fields.

For an AI Agent, import `examples/ai-agent-tool.json`, connect your chat-model credential, and select the service credential when required. The node supports **Use as AI Tool**; the example uses `$fromAI` for the main lookup input. Review tool inputs and any usage charges before executing.

No API keys, account identifiers, or private data are included in the examples. Request data goes to Wine Labs; no telemetry is added. The node has no runtime dependencies and uses n8n HTTP and binary helpers.

## Development

Requires Node.js 24 for the current n8n development toolchain.

```sh
npm ci --ignore-scripts --legacy-peer-deps
npm run lint
npm run build
npm test
npm run dev
```

The package follows the official `@n8n/node-cli` starter conventions. The HTTP request builder has contract tests and execution tests with mocked HTTP helpers. Live authenticated execution and the verification recording must be completed with operator-supplied credentials.

## Publishing and verification

See [RELEASE.md](RELEASE.md). `.github/workflows/publish.yml` publishes from GitHub Actions with npm provenance. Configure the npm trusted publisher for this repository and `publish.yml`, or provide the repository's `NPM_TOKEN` secret for the first release. Publication and n8n approval are separate steps.

API documentation: [Wine Labs documentation](https://winelabs.ai/api/docs).

## License

MIT
