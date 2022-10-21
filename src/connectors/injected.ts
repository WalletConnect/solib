import base58 from 'bs58'
import { setAddress } from '../store'
import type { TransactionArgs, TransactionType } from '../types/requests'
import type { Connector } from './base'
import { BaseConnector } from './base'

export interface PhantomPublicKey {
  length: number
  negative: number
  words: Uint8Array
  toString: () => string
}

export class InjectedConnector extends BaseConnector implements Connector {
  public injectedWalletPath: string

  public constructor(injectedWallet: string) {
    super()
    if (!injectedWallet) throw new Error('Invalid path provided, should match window..*')
    const walletPathSplit = injectedWallet.split('.')
    if (walletPathSplit[0] !== 'window')
      throw new Error('Injected wallet path must start at window')
    this.injectedWalletPath = injectedWallet
  }

  public static connectorName(walletName: string) {
    return `injected-${walletName}`
  }

  public getConnectorName(): string {
    return InjectedConnector.connectorName(this.injectedWalletPath)
  }

  protected async getProvider() {
    const providerPath = this.injectedWalletPath.split('.').slice(1)

    if (typeof window !== 'undefined') {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const injectedWalletProvider = providerPath.reduce<any>((provider, accessor) => {
        if (provider) return provider[accessor]

        return null
      }, window)

      if (injectedWalletProvider) return Promise.resolve(injectedWalletProvider)

      return Promise.reject(
        new Error(`Injected wallet not found at path ${this.injectedWalletPath}`)
      )
    }

    throw new Error('No Phantom provider found')
  }

  public isAvailable(): boolean {
    return Boolean(this.getProvider())
  }

  public async connect() {
    const resp = await (await this.getProvider()).connect()

    if (resp?.publicKey) {
      setAddress(resp.publicKey.toString())

      return resp.publicKey.toString()
    } else if (resp?.publickey) {
      setAddress(resp.publickey.toString())

      return resp.publickey.toString()
    } else if (resp === true) {
      const pubkey = (await this.getProvider()).publickey
      setAddress(pubkey)

      return pubkey
    }

    throw new Error('Failed to connect')
  }

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message)
    const signedMessage = await this.request('signMessage', {
      message: encodedMessage,
      format: 'utf8'
    })

    if (!signedMessage) throw new Error(`Failed to sign message using ${this.getConnectorName()}`)

    const { signature } = signedMessage

    return signature
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    const transaction = await this.constructTransaction(type, params)

    const signedTransaction = await (await this.getProvider()).signTransaction(transaction)

    if (signedTransaction) return base58.encode(signedTransaction.serialize())
    else throw new Error(`Could not sign transaction using ${this.getConnectorName()}`)
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    return this.sendTransaction(await this.signTransaction(type, params))
  }
}
