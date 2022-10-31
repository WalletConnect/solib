# Solana Name Service

Integration with the Solana Name Service is baked in to Solib.

## Fetch Name
`fetchName` works as a reverse lookup, address -> domain

```ts
import { fetchName } from '@walletconnect/solib'

const domain = await fetchName('FidaeBkZkvDqi1GXNEwB8uWmj9Ngx2HXSS5nyGRuVFcZ')

console.log(domain) // bonafida.sol
```

