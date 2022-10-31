# Connectors

Connectors are what Solib uses to communicate with all the different wallets it
supports.

## Current Connectors

### WalletConnectConnector 
`WalletConnectConnector` is used to communicate with the plethora of wallets
that support WalletConnect like Spot, Math Wallet and many others.

#### Creation
```ts
new WalletConnectConnector({
  relayerRegion: 'wss://relay.walletconnect.com', // which relay to use
  metadata: {
    description: 'Test app for solib',
    name: 'Test Solib dApp',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    url: 'http://localhost:3000'
  },
  // Should the connector automatically connect if a pairing was made before
  autoconnect: true, 
  // Should WalletConnectConnector automatically display a qrcode modal for the user
  qrcode: true
})

```

### InjectedConnector 
`InjectedConnector` is used to support wallets that are used as browser
extensions. Eg: `solflare` or `phantom`.

#### Creation
To create an InjectedConnector, simply give it a path. The most common path is
`window.solana`, but there are other wallets with their own path like
`window.solflare`. 

```ts
import { InjectedConnector }  from '@walletconnect/solib'

new InjectedConnector('window.solana');
```

### Phantom Connector
Phantom Connector is simply an `InjectedConnector` with Phantom's provider's
path preloaded for convenience.

#### Creation

```ts
new PhantomConnector()
```

