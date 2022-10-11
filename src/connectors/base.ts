import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import Store from '../store'
import {
  ClusterRequestMethods,
  ClusterSubscribeRequestMethods,
  RequestMethods,
  TransactionArgs,
  TransactionType
} from '../types/requests'
import { ClusterFactory } from '../utils/clusterFactory'

export interface Connector {
  isAvailable: () => boolean
  getConnectorName: () => string
  connect: () => Promise<string>
  signMessage: (message: string) => any
  signTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>
  sendTransaction: (encodedTransaction: string) => Promise<string>
  signAndSendTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>
  getBalance: (requestedAddress?: string) => any
  watchTransaction: (
    transactionSignature: string,
    callback: (params: any) => void
  ) => Promise<() => void>
}

export class BaseConnector {
  public getConnectorName() {
    return 'base'
  }
  protected getProvider(): Promise<{
    request: (args: { method: any; params: any }) => any
  }> | null {
    return null
  }

  protected async constructTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = new Transaction()

    const fromAddress = Store.getAddress()

    if (!fromAddress) throw new Error('No address connected')

    switch (type) {
      case 'transfer':
        const fromPubkey = new PublicKey(fromAddress)
        const toPubkey = new PublicKey(params.to)
        transaction.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: params.amountInLamports
          })
        )
        transaction.feePayer = params.feePayer === 'from' ? fromPubkey : toPubkey
    }

    let { value } = await this.requestCluster('getLatestBlockhash', [{}])
    const { blockhash: recentBlockhash } = value
    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  public async sendTransaction(encodedTransaction: string) {
    const signature = await this.requestCluster('sendTransaction', [encodedTransaction])

    return signature
  }

  public async watchTransaction(transactionSignature: string, callback: (params: any) => void) {
    return await this.subscribeToCluster('signatureSubscribe', [transactionSignature], callback)
  }

  public async getBalance(requestedAddress?: string) {
    const address = requestedAddress ?? Store.getAddress()
    if (!address) return null

    const balance = await this.requestCluster('getBalance', [address])

    return balance.value
  }

  public async request<Method extends keyof RequestMethods>(
    method: Method,
    params: RequestMethods[Method]['params']
  ): Promise<RequestMethods[Method]['returns']> {
    return (await this.getProvider())?.request({ method, params })
  }

  public async subscribeToCluster<Method extends keyof ClusterSubscribeRequestMethods>(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]['returns'],
    callback: (params: any) => void
  ) {
    const id = await ClusterFactory.registerListener(method, params, callback)

    return async () => {
      await ClusterFactory.unregisterListener(id)
    }
  }

  public async requestCluster<Method extends keyof ClusterRequestMethods>(
    method: Method,
    params: ClusterRequestMethods[Method]['params']
  ): Promise<ClusterRequestMethods[Method]['returns']> {
    const cluster = Store.getCluster()
    const endpoint = cluster.endpoint
    const res: { result: ClusterRequestMethods[Method]['returns'] } = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        method,
        params,
        jsonrpc: '2.0',
        id: Store.getNewRequestId()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async res => {
      const json = await res.json()

      console.log({ json })
      return json
    })

    return res.result
  }
}
