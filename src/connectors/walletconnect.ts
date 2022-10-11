import UniversalProvider from '@walletconnect/universal-provider'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { BaseConnector, Connector } from './base'
import { TransactionArgs, TransactionType } from '../types/requests'
import Store from '../store'
import base58 from 'bs58'
import { PublicKey } from '@solana/web3.js'

const DEFAULT_LOGGER = 'error'

export interface WalletConnectAppMetadata {
  name: string
  description: string
  url: string
  icons: Array<string>
}

class UniversalProviderFactory {
  static provider: UniversalProvider | undefined
  static relayerRegion: string | undefined
  static projectId: string | undefined
  static metadata: WalletConnectAppMetadata | undefined

  public static setSettings(params: {
    projectId: string
    relayerRegion: string
    metadata: WalletConnectAppMetadata
    qrcode: boolean
  }) {
    UniversalProviderFactory.relayerRegion = params.relayerRegion
    UniversalProviderFactory.projectId = params.projectId
    UniversalProviderFactory.metadata = params.metadata
  }

  public static async getProvider() {
    if (!UniversalProviderFactory.provider) {
      await UniversalProviderFactory.init()
    }
    return UniversalProviderFactory.provider!
  }

  public static async init() {
    UniversalProviderFactory.provider = await UniversalProvider.init({
      logger: DEFAULT_LOGGER,
      relayUrl: UniversalProviderFactory.relayerRegion,
      projectId: UniversalProviderFactory.projectId,
      metadata: UniversalProviderFactory.metadata
    })

    // Subscribe to session ping
    UniversalProviderFactory.provider.on('session_ping', ({ id, topic }: any) => {
      console.log(id, topic)
    })

    // Subscribe to session event
    UniversalProviderFactory.provider.on('session_event', ({ event, chainId }: any) => {
      console.log(event, chainId)
    })

    // Subscribe to session update
    UniversalProviderFactory.provider.on('session_update', ({ topic, params }: any) => {
      console.log(topic, params)
    })

    // Subscribe to session delete
    UniversalProviderFactory.provider.on('session_delete', ({ id, topic }: any) => {
      console.log(id, topic)
    })
  }
}

export class WalletConnectConnector extends BaseConnector implements Connector {
  provider: UniversalProvider | undefined
  protected qrcode: boolean

  constructor({
    projectId,
    relayerRegion,
    metadata,
    qrcode,
    autoconnect
  }: {
    projectId: string
    relayerRegion: string
    metadata: WalletConnectAppMetadata
    qrcode?: boolean
    autoconnect?: boolean
  }) {
    super()
    this.qrcode = !!qrcode
    UniversalProviderFactory.setSettings({
      projectId,
      relayerRegion,
      metadata,
      qrcode: this.qrcode
    })
    if (autoconnect) {
      console.log('WC constructor > autoconnect true')
      UniversalProviderFactory.getProvider().then(provider => {
        console.log('Provider state', { provider })
        if (
          provider.session.namespaces &&
          provider.session.namespaces['solana']?.accounts?.length
        ) {
          const defaultAccount = provider.session.namespaces['solana'].accounts[0]
          console.log('Found accounts', defaultAccount)
          const address = defaultAccount.split(':')[2]
          Store.setAddress(address)
        }
      })
    }
  }

  public static get connectorName() {
    return 'walletconnect'
  }

  public getConnectorName(): string {
    return WalletConnectConnector.connectorName
  }

  public isAvailable() {
    return true
  }

  protected async getProvider() {
    return await UniversalProviderFactory.getProvider()
  }

  public async signMessage(message: string) {
    const address = Store.getAddress()
    if (!address) throw new Error('No signer connected')

    const signedMessage = await this.request('solana_signMessage', {
      message: base58.encode(new TextEncoder().encode(message)),
      pubkey: address
    })
    const { signature } = signedMessage

    return { signature }
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = await this.constructTransaction(type, params)
    console.log('Made transaction', transaction)

    const transactionParams = {
      feePayer: transaction.feePayer?.toBase58()!,
      instructions: transaction.instructions.map(instruction => ({
        data: base58.encode(instruction.data),
        keys: instruction.keys.map(key => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58()
        })),
        programId: instruction.programId.toBase58()
      })),
      recentBlockhash: transaction.recentBlockhash!
    }

    console.log('Formatted transaction', transactionParams)

    const res = await this.request('solana_signTransaction', transactionParams)
    transaction.addSignature(
      new PublicKey(Store.getAddress()!),
      Buffer.from(base58.decode(res.signature))
    )

    const validSig = transaction.verifySignatures()

    if (!validSig) throw new Error('Signature invalid.')

    console.log({ res, validSig })
    return base58.encode(transaction.serialize())
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    return await this.sendTransaction(await this.signTransaction(type, params))
  }

  /**
   * Connect to user's wallet.
   *
   * If `WalletConnectConnector` was configured with `qrcode = true`, this will
   * open a QRCodeModal, where the user will scan the qrcode and then this
   * function will resolve/return the address of the wallet.
   *
   * If `qrcode = false`, this will return the pairing URI used to generate the
   * QRCode.
   */
  public async connect() {
    const chosenCluster = Store.getCluster()
    const clusterId = `solana:${chosenCluster.id}`
    const solanaNamespace = {
      solana: {
        chains: [clusterId],
        methods: ['solana_signMessage', 'solana_signTransaction'],
        events: [],
        rpcMap: {
          [clusterId]: chosenCluster.endpoint
        }
      }
    }

    const provider = await UniversalProviderFactory.getProvider()

    return new Promise<string>(async resolve => {
      provider.on('display_uri', (uri: string) => {
        if (this.qrcode) {
          QRCodeModal.open(uri, (data: any) => {
            console.log('Opened QRCodeModal', data)
          })
        } else resolve(uri)
      })

      console.log({
        solanaNamespace,
        provider,
        thing: (provider as any).target
      })

      const rs = await provider.connect({
        pairingTopic: undefined,
        namespaces: solanaNamespace
      })

      if (this.qrcode) {
        if (!rs) throw new Error('Failed connection.')
        const address = rs.namespaces.solana.accounts[0].split(':')[2]

        Store.setAddress(address)

        console.log({ rs })

        resolve(address)
      }
    })
  }
}
