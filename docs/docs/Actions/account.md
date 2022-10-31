# Account Actions

The following actions are concerned with connecting and communicating
information about an account.

## Connection Management

### Connect

The `connect` function uses the connector defined in the `init` function, or a
connector that was switched to using `switchConnector`. Retrieving the address 
is done by watching it before the connect call.

```ts
import { connect } from '@walletconnect/solib'

await connect()
```

### Watch Address

`watchAddress` watches Solib's state and updates when an address is either
connected *or disconnected*.

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

### Disconnect

`disconnect` does the necessary work to communicate with the wallet to
disconnect, and remove the address from state to help reflect changes on the UI
easier. Note, `watchAddress` will now call the callback with `''` for the
public key.

```ts
import { disconnect } from '@walletconnect/solib'

await disconnect()
```

### Get Address

`getAddress` returns the address connected in state in a synchronous manner.

```ts
import { getAddress } from '@walletconnect/solib'

const address = getAddress() // 3x08...
```

## Signatures

### Sign Message
With `signMessage`, there is no need to worry about how the user is connected or
what wallet they are using, `signMessage` will call the appropiate `Connector`
configured in `init` or chosen using `switchNetwork`.

```ts
import { signMessage } from '@walletconnect/solib'

const message = 'Some message'
const signature = await signMessage(message);
```

## Account Information

### Get Balance
`getBalance` retrieves the balance communicates with the cluster configured in `init` or chosen
using `switchNetwork`.

```ts
import { getBalance } from '@walletconnect/solib'

// No need to supply an address as it will automatically use address connected.
const balance = await getBalance()
```

### Get Account
`getAccount` retrieves account information from the cluster.

```ts
import { getAccount } from '@walletconnect/solib'

// Operates the same way as `getBalance`.
const account = await getAccount()
```










