# Solib

Solana friendly API

# Current Capabilities

## API
- Connect Wallet:
  - Phantom
- Get balance
- Sign Transaction
- Send Transaction
- Sign and send Transaction
- Sign Message
- Watch Transactions

## Internals
- Generic transaction construction
- Using cluster `sendTransaction` to avoid depending on aa wallet's
  implementation, only having to use their `signMessage` function
- Internal store maintaining state
- Base connector to help with making future connectors (Eg: WalletConnect
  connector)
- Generic typing
- From scratch cluster websocket factory so we can listen to events and attach
  custom listeners in the future, in a generic manner.

# Development

For now when developing, feel free to use the `example/dev.sh` to help with
refreshing the cache and installing a fresh local `solib` package to test your
changes. TODO: Will look into making this better.

# Folders

## Example
Example app written in react, for testing

## Src

Actual source code.

- actions: This where most of the developer public will live. Actions are what
  developers will use to fetch and manipulate data on the solana blockchain
- connectors: This is where connectors will live. Connectors are basically
  adapters using wallet providers (Eg: Phantom). `base.ts` is a base class that
  has functionality for building connectors, as well as non-wallet-specific
  actions (eg: fetching wallet balance from the cluster)
- defaults: This is where default things will live, like the clusters we have
  configured
- store: A rudimentary store used for storing address, chosen cluster, etc
- types: Self explanatory. Not *all* types need to live here, however.
- utils: Self explanatory.


# Resources:
- [Web3Solana API Introduction](https://docs.solana.com/developing/clients/javascript-api)
- [Solana JSONRPC API](https://docs.solana.com/developing/clients/jsonrpc-api)
- [Solana Faucet for dev](https://solfaucet.com/)
- [Phantom Docs](https://docs.phantom.app/integrating/extension-and-in-app-browser-web-apps/establishing-a-connection)
- [solana/web3 API](https://solana-labs.github.io/solana-web3.js/modules.html)
