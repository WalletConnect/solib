import UniversalProvider from "@walletconnect/universal-provider";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { BaseConnector, Connector } from "./base";
import { TransactionArgs, TransactionType } from "../types/requests";
import Store from "../store";
import base58 from "bs58";
import { PublicKey } from "@solana/web3.js";

const DEFAULT_LOGGER = "error";

export interface WalletConnectAppMetadata {
  name: string;
  description: string;
  url: string;
  icons: Array<string>;
}

const UniversalProviderFactory = (function () {
  let provider: UniversalProvider | undefined;
  let relayerRegion: string | undefined;
  let projectId: string | undefined;
  let qrcode: boolean;
  let metadata: WalletConnectAppMetadata | undefined;

  async function initProvider() {
    provider = await UniversalProvider.init({
      logger: DEFAULT_LOGGER,
      relayUrl: relayerRegion,
      projectId: projectId,
      metadata: metadata,
    });

    // Subscribe to session ping
    provider.on("session_ping", ({ id, topic }: any) => {
      console.log(id, topic);
    });

    // Subscribe to session event
    provider.on("session_event", ({ event, chainId }: any) => {
      console.log(event, chainId);
    });

    // Subscribe to session update
    provider.on("session_update", ({ topic, params }: any) => {
      console.log(topic, params);
    });

    // Subscribe to session delete
    provider.on("session_delete", ({ id, topic }: any) => {
      console.log(id, topic);
    });
  }

  return {
    setSettings: function (
      _projectId: string,
      _relayerRegion: string,
      _metadata: WalletConnectAppMetadata,
      _qrcode: boolean
    ) {
      relayerRegion = _relayerRegion;
      projectId = _projectId;
      metadata = _metadata;
      qrcode = _qrcode;
      console.log(qrcode);
    },
    getProvider: async function () {
      if (!provider) {
        await initProvider();
      }
      return provider!;
    },
  };
})();

export class WalletConnectConnector extends BaseConnector implements Connector {
  provider: UniversalProvider | undefined;

  constructor(
    protected projectId: string,
    protected relayerRegion: string,
    protected metadata: WalletConnectAppMetadata,
    protected qrcode?: boolean,
    autoconnect?: boolean
  ) {
    super();
    UniversalProviderFactory.setSettings(
      projectId,
      relayerRegion,
      metadata,
      qrcode || false
    );
    if (autoconnect) {
      console.log("WC constructor > autoconnect true");
      UniversalProviderFactory.getProvider().then((provider) => {
        console.log("Provider state", { provider });
        if (
          provider.session.namespaces &&
          provider.session.namespaces["solana"]?.accounts?.length
        ) {
          const defaultAccount =
            provider.session.namespaces["solana"].accounts[0];
          console.log("Found accounts", defaultAccount);
          const address = defaultAccount.split(":")[2];
          new Store().setAddress(address);
        }
      });
    }
  }

  public static get connectorName() {
    return "walletconnect";
  }

  public getConnectorName(): string {
    return WalletConnectConnector.connectorName;
  }

  public isAvailable() {
    return true;
  }

  protected async getProvider() {
    return await UniversalProviderFactory.getProvider();
  }

  public async signMessage(message: string) {
    const address = new Store().getAddress();
    if (!address) throw new Error("No signer connected");

    const signedMessage = await this.request("solana_signMessage", {
      message: base58.encode(new TextEncoder().encode(message)),
      pubkey: address,
    });
    const { signature } = signedMessage;

    return { signature };
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = await this.constructTransaction(type, params);
    console.log("Made transaction", transaction);

    const transactionParams = {
      feePayer: transaction.feePayer?.toBase58()!,
      instructions: transaction.instructions.map((instruction) => ({
        data: base58.encode(instruction.data),
        keys: instruction.keys.map((key) => ({
          isWritable: key.isWritable,
          isSigner: key.isSigner,
          pubkey: key.pubkey.toBase58(),
        })),
        programId: instruction.programId.toBase58(),
      })),
      recentBlockhash: transaction.recentBlockhash!,
    };

    console.log("Formatted transaction", transactionParams);

    const res = await this.request("solana_signTransaction", transactionParams);
    transaction.addSignature(
      new PublicKey(new Store().getAddress()!),
      Buffer.from(base58.decode(res.signature))
    );

    const validSig = transaction.verifySignatures();

    if (!validSig) throw new Error("Signature invalid.");

    console.log({ res, validSig });
    return base58.encode(transaction.serialize());
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    return await this.sendTransaction(await this.signTransaction(type, params));
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
    const chosenCluster = new Store().getCluster();
    const clusterId = `solana:${chosenCluster.id}`;
    const solanaNamespace = {
      solana: {
        chains: [clusterId],
        methods: ["solana_signMessage", "solana_signTransaction"],
        events: [],
        rpcMap: {
          [clusterId]: chosenCluster.endpoint,
        },
      },
    };

    const provider = await UniversalProviderFactory.getProvider();

    return new Promise<string>(async (resolve) => {
      provider.on("display_uri", (uri: string) => {
        if (this.qrcode) {
          QRCodeModal.open(uri, (data: any) => {
            console.log("Opened QRCodeModal", data);
          });
        } else resolve(uri);
      });

      console.log({
        solanaNamespace,
        provider,
        thing: (provider as any).target,
      });

      const rs = await provider.connect({
        pairingTopic: undefined,
        namespaces: solanaNamespace,
      });

      if (this.qrcode) {
        if (!rs) throw new Error("Failed connection.");
        const address = rs.namespaces.solana.accounts[0].split(":")[2];

        new Store().setAddress(address);

        console.log({ rs });

        resolve(address);
      }
    });
  }
}
