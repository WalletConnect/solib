import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction
} from '@solana/web3.js'
import base58 from 'bs58'
import { getAddress, getCluster, getNewRequestId } from '../store'
import type {
  ClusterRequestMethods,
  ClusterSubscribeRequestMethods,
  RequestMethods,
  TransactionArgs,
  TransactionType
} from '../types/requests'
import { registerListener, unregisterListener } from '../utils/clusterFactory'

export interface Connector {
  isAvailable: () => boolean
  getConnectorName: () => string
  connect: () => Promise<string>
  signMessage: (message: string) => Promise<string>
  signTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>
  sendTransaction: (encodedTransaction: string) => Promise<string>
  signAndSendTransaction: <Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) => Promise<string>
  getBalance: (requestedAddress?: string) => Promise<number | null>
  watchTransaction: (
    transactionSignature: string,
    callback: (params: unknown) => void
  ) => Promise<() => void>
}

export class BaseConnector {
  public getConnectorName() {
    return 'base'
  }
  protected async getProvider(): Promise<{
    /* eslint-disable @typescript-eslint/no-explicit-any */
    request: (args: any) => any
  }> {
    return Promise.reject(new Error('No provider in base connector'))
  }

  protected async constructTransaction<TransType extends keyof TransactionArgs>(
    type: TransType,
    params: TransactionArgs[TransType]['params']
  ) {
    const transaction = new Transaction()

    const fromAddress = getAddress()

    if (!fromAddress) throw new Error('No address connected')
    const fromPubkey = new PublicKey(fromAddress)

    if (type === 'transfer') {
      const transferParams = params as TransactionArgs['transfer']['params']
      const toPubkey = new PublicKey(transferParams.to)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: new PublicKey(transferParams.to),
          lamports: transferParams.amountInLamports
        })
      )
      transaction.feePayer = transferParams.feePayer === 'from' ? fromPubkey : toPubkey
    } else if (type === 'program') {
      const programParams = params as TransactionArgs['program']['params']
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: fromPubkey, isSigner: true, isWritable: programParams.isWritableSender }
          ],
          programId: new PublicKey(programParams.programId),
          data: Buffer.from(base58.decode(JSON.stringify(programParams.data)))
        })
      )
      transaction.feePayer = fromPubkey
    }

    const { value } = await this.requestCluster('getLatestBlockhash', [{}])
    const { blockhash: recentBlockhash } = value
    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  public async sendTransaction(encodedTransaction: string) {
    const signature = await this.requestCluster('sendTransaction', [encodedTransaction])

    return signature
  }

  public async watchTransaction(
    transactionSignature: string,
    callback: (params: Transaction) => void
  ) {
    return this.subscribeToCluster('signatureSubscribe', [transactionSignature], callback)
  }

  public async getBalance(requestedAddress?: string) {
    const address = requestedAddress ?? getAddress()
    if (!address) return null

    const balance = await this.requestCluster('getBalance', [address])

    return balance.value
  }

  public async getProgramAccounts(requestedAddress: string) {
    const programAccounts = await this.requestCluster('getProgramAccounts', [requestedAddress])

    return programAccounts.value
  }

  public async callProgram() {}

  public async request<Method extends keyof RequestMethods>(
    method: Method,
    params: RequestMethods[Method]['params']
  ): Promise<RequestMethods[Method]['returns']> {
    return (await this.getProvider()).request({ method, params })
  }

  public async subscribeToCluster<Method extends keyof ClusterSubscribeRequestMethods>(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]['params'],
    callback: (params: ClusterSubscribeRequestMethods[Method]['returns']) => void
  ) {
    const id = await registerListener(method, params, callback)

    return () => {
      unregisterListener(id)
    }
  }

  public async requestCluster<Method extends keyof ClusterRequestMethods>(
    method: Method,
    params: ClusterRequestMethods[Method]['params']
  ): Promise<ClusterRequestMethods[Method]['returns']> {
    const cluster = getCluster()
    const { endpoint } = cluster
    const res: { result: ClusterRequestMethods[Method]['returns'] } = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        method,
        params,
        jsonrpc: '2.0',
        id: getNewRequestId()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async httpRes => {
      const json = await httpRes.json()

      console.log({ json })

      return json
    })

    return res.result
  }
}
