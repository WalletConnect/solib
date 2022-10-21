import type { Transaction } from '@solana/web3.js'
import base58 from 'bs58'
import { setAddress } from '../store'
import type { RequestMethods, TransactionArgs, TransactionType } from '../types/requests'
import type { Connector } from './base'
import { BaseConnector } from './base'

export interface PhantomPublicKey {
  length: number
  negative: number
  words: Uint8Array
  toString: () => string
}

declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: PhantomPublicKey }>
        disconnect: () => Promise<void>
        request: <Method extends keyof RequestMethods>(
          params: RequestMethods[Method]['params']
        ) => RequestMethods[Method]['returns']
        signTransaction: (transaction: Transaction) => Promise<{
          serialize: () => Uint8Array
        }>
        signMessage: (message: Uint8Array, format: string) => Promise<{ signature: Uint8Array }>
      }
    }
  }
}
export class PhantomConnector extends BaseConnector implements Connector {
  public static readonly connectorName = 'phantom'

  public geConnectortName(): string {
    return PhantomConnector.connectorName
  }
  protected async getProvider() {
    if (typeof window !== 'undefined' && window.phantom)
      return Promise.resolve(window.phantom.solana)

    throw new Error('No Phantom provider found')
  }

  public isAvailable(): boolean {
    return Boolean(this.getProvider())
  }

  public async connect() {
    const resp = await (await this.getProvider()).connect()
    setAddress(resp.publicKey.toString())

    return resp.publicKey.toString()
  }

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message)
    const signedMessage = await this.request('signMessage', {
      message: encodedMessage,
      format: 'utf8'
    })
    const { signature } = signedMessage

    return signature
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    const transaction = await this.constructTransaction(type, params)

    const signedTransaction = await (await this.getProvider()).signTransaction(transaction)

    return base58.encode(signedTransaction.serialize())
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    return this.sendTransaction(await this.signTransaction(type, params))
  }
}
