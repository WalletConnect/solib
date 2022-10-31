# Transaction Actions
The following actions are concerned with making and retrieving information about
transactions.

## Transaction format.

Since the Transaction object itself is complex and involved. (Eg, needing to
retrieve the most recent blockhash and formatting signatures, Solib provides a
simplified transaction format. 

### Transfer format

```ts
export interface TransactionArgs {
  to: string // base58 encoded address
  feePayer: 'from' | 'to' // Will the sender or reciever pay the network fees
  amountInLamports: number
}

const transactionArgs = {
  to: '5C0....',
  feePayer: 'from',
  amountInLamports: 2000000
}
```

## Sending transactions

### Signing transactions
`signTransaction` signs the transaction using the `Connector` configured, but
does not send any information to the cluster.

```ts
import { signTransaction } from '@walletconnect/solib'

const transactionSignature = await signTransaction(transactionArgs);
```

### Sending transactions

Although `sendTransaction` can be used separately, it is best to use
`signAndSendTransaction` to prevent the transaction failing due to outdated
`recentBlockhash` since that is retrieved during transaction signing.

```ts
import { sendTransaction } from '@walletconnect/solib'

const sentTransaction = await sendTransaction(transactionSignature);
```

### Sign and Send Transaction

`signAndSendTransaction` is the main function that will be used to make
transactions as it will handle all steps of making, signing and sending a
transaction.

```ts
import { signAndSendTransaction } from '@walletconnect/solib'

const sentTransaction = await signAndSendTransaction(transactionArgs);
```

## Retrieving transaction information

### Watch Transaction

`watchTransaction` watches a transaction until completion, note this function
does not provide transaction information. Only an `{ err: null | Error}` object.
if `err === null`, then the transaction succeeded on the blockchain.

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

### Get Transaction

`getTransaction` can be used to retrieve actual transaction information, all
data recieved from the cluster is forwarded and nothing is omitted.

```ts
import { getTransaction } from '@walletconnect/solib'

// already successful and confirmed transaction signature.
const successfulTransactionSignature = '' 

const transactionInfo = await getTransaction(successfulTransactionSignature);
```

#### Use in tandem with `watchTransaction`

```ts
import { signAndSendTransaction, watchTransaction, getTransaction } from '@walletconnect/solib'

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
    const transactionInfo = await getTransaction(transactionSignature);
  }
  else {
    // transaction failed.
  }
})
```

### Get fee for message
Before sending a transaction, `getFeeForMessage` can be used to retrieve the
transaction network fee.

```ts
import { getFeeForMessage } from '@walletconnect/solib'

const fee = await getFeeForMessage('transfer', {
  to,
  amountInLamports,
  feePayer: 'from'
})
```


