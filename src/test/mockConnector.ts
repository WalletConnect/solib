import type { TransactionArgs } from '../types/requests'
import type { Connector } from '../connectors/base'
import { Keypair } from '@solana/web3.js'
import { BaseConnector } from '../connectors/base'

export default class MockConnector extends BaseConnector implements Connector {
  public keypair: Keypair

  public constructor() {
    super()
    this.keypair = Keypair.generate()
  }

  public isAvailable() {
    return true
  }

  public async connect() {
    return Promise.resolve(this.keypair.publicKey.toBase58())
  }

  public async signMessage(message: string) {
    return Promise.resolve(message)
  }

  public async signTransaction<Type extends keyof TransactionArgs>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    return Promise.resolve(`${type}-${JSON.stringify(params)}`)
  }

  public async signAndSendTransaction<Type extends keyof TransactionArgs>(
    type: Type,
    params: TransactionArgs[Type]['params']
  ) {
    return Promise.resolve(`${type}-${JSON.stringify(params)}`)
  }
}
