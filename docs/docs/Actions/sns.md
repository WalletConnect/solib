# Solana Name Service

Integration with the Solana Name Service is baked in to Solib.

## Fetch Name
`fetchName` works as a reverse lookup, address -> domain

```ts
import { fetchName } from '@walletconnect/solib'

const domain = await fetchName('FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ')

console.log(domain) // bonafida.sol
```

## Fetch Address From Domain
`fetchAddressFromDomain` works as a normal lookup, domain -> address

```ts
import { fetchAddressFromDomain } from '@walletconnect/solib'

const address = await fetchAddressFromDomain('levi.sol')

console.log(domain) // JUskoxS2PTiaBpxfGaAPgf3cUNhdeYFGMKdL6mZKKfR
```



