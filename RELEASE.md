# Release and n8n submission

Package: `n8n-nodes-wine-labs`. Initial version: `0.1.0`.
Repository: https://github.com/imiraoui/n8n-nodes-wine-labs
Integration name: Wine Labs
Description: Match wines, retrieve merchant offers, and look up wine market data.
Product website: https://winelabs.ai
API documentation: https://winelabs.ai/api/docs

## Release

1. Confirm the npm publisher account and public author/contact values with the operator.
2. Set the npm trusted publisher to owner `imiraoui`, repository `n8n-nodes-wine-labs`, workflow `publish.yml`. Permit direct `npm publish` for this workflow. New packages may need npm's initial package reservation/bootstrap or a scoped `NPM_TOKEN` in GitHub Actions.
3. CI must pass. Create tag `v0.1.0` or dispatch Publish. Confirm the published version and its provenance on npm. Do not publish locally for n8n verification.
4. Install **exactly** `n8n-nodes-wine-labs@0.1.0` on a self-hosted n8n instance and verify real responses with a service test credential.

## Uncut verification recording

Record the real n8n browser in one continuous take, with credentials masked. Show:

1. n8n version and Settings → Community Nodes.
2. Installation of `n8n-nodes-wine-labs@0.1.0` from npm.
3. Credential creation/testing where the service requires it; no secret is displayed in the recording.
4. Successful execution of at least two operations with real API results.
5. The node attached as an AI Agent tool, a real chat-model credential selected, and successful tool execution.

Do not substitute a mock server, edited video, simulated browser, or local package installation for this published-version demonstration. Example workflows are provided for rehearsal; no compliant recording exists yet.

## Creator Portal

Sign in at https://creators.n8n.io/nodes and submit this npm package, repository, integration name, description, product link, docs, and the recording. The portal needs an operator-approved contact identity. Record the submission URL and review status after submitting. A published npm package alone is not an n8n listing.
