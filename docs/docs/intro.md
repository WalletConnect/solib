---
sidebar_position: 1
slug: /
title: Getting Started
---


# Solib

Solib is a friendly, easy to use Solana API. All the functionality needed to interact with Solana is baked into Solib, including connecting wallets, signing messages, sending transactions, interacting with Bonafida's name service  and more.

## Getting started

Getting started with Solib is as simple as calling a couple of functions. No
need to worry about managing clients or state, all of it is handled in the
background.

## Installation

Instal Solib using the following

```bash npm2yarn
npm install --save @walletconnect/solib
```

## Initializing Solib

The init function needs to be called to prepare solib to be able to call all the functions in its API.

```ts
import { 
  init, PhantomConnector, WalletConnectConnector, 
  InjectedConnector, mainnetBetaWalletConnect
} from '@walletconnect/solib'

init(() => ({
    // The different connector methodologies that will be used.
    // PhantomConnector will interact with injected Phantom Wallet using browser
    // extension, while WalletConnectConnector can be used to interact with all
    // wallets that support the WalletConnect protocol.
    connectors: [
      new PhantomConnector(),
      new InjectedConnector('window.solib'),
      new InjectedConnector('window.solflare'),
      new WalletConnectConnector({
        relayerRegion: 'wss://relay.walletconnect.com',
        metadata: {
          description: 'Test app for solib',
          name: 'Test Solib dApp',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
          url: 'http://localhost:3000'
        },
        autoconnect: true,
        qrcode: true
      })
    ],
    // Name of the connector to be used.
    // The connector needs to be registered in the connectors field above.
    // This can be switched later using `switchConnector` function.
    connectorName: WalletConnectConnector.connectorName,
    // The name of the cluster and network to use.
    // Here, `mainnetBeta` refers to the mainnetBeta Solana network, while
    // `WalletConnect` is the RPC server thhat will be used to do the communication
    chosenCluster: mainnetBetaWalletConnect(PROJECT_ID)
  })
}, PROJECT_ID)
```

## Establish connection
Once the `init` function is called successfully somewhere in the app, the next
step is establishing a connection with a wallet.

```ts
import { connect, watchAddress } from '@walletconnect/solib'


watchAddress(pubkey => {
  if (pubkey) {
    // update UI to reflect successful connection
  }
  else {
    // Failed connection.
  }
})

await connect()
```

## Start interacting with clusters and the wallet.
After a public key / address is retrieved, all functions are now available for
usage.

```ts
import { getBalance, signMessage } from '@walletconnect/solib'

// This communicates with the cluster defined in `init`
// You can change the chosen cluster using `switchNetwork`
// No need to supply an address as it will automatically used connected address
const balance = await getBalance();

// This communicates with the `Connector` or "Wallet" specified in `init`.
// For example, if `PhantomConnector` is used, it will call Phantom's
// `signMessage` under the hood. If `WalletConnectConnector` is used, it will
// communicate using WalletConnect's sign API.
const signature = await signMessage('Some message to sign')
```

## Initiating a transaction
Signing and sending a transaction no longer needs fetching recent blockhashes,
or worrying about the `Transaction` data format. Simple call
`signAndSendTransaction`.

```ts
import { signAndSendTransaction, watchTransaction } from '@walletconnect/solib'

// Signature is signed and sent to the network.
const transactionSignature = await signAndSendTransaction(
  'transfer', 
  { 
    to: '<PUBKEY_BASE58>' // the wallet address of the reciever,
    amountInLamports: 200000, 
    feePayer: 'from' // sender pays for network fees
  }
)       

watchTransaction(transactionSignature, ({err}) => {
  if (!err) {
    // transaction successful on the network
  }
  else {
    // transaction failed.
  }
})
```







