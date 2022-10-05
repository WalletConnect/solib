import UniversalProvider from "@walletconnect/universal-provider";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { BaseConnector, Connector } from "./base";
import { solanaClusters } from "../defaults/clusters";
import { TransactionArgs, TransactionType } from "../types/requests";

const DEFAULT_LOGGER = "debug";

export interface WalletConnectAppMetadata {
  name: string;
  description: string;
  url: string;
  icons: Array<string>;
}

export class WalletConnectConnector extends BaseConnector implements Connector {
  provider: UniversalProvider | undefined;
  projectId: string;
  metadata: WalletConnectAppMetadata;
  relayerRegion: string;
  public isAvailable() {
    return true;
  }

  constructor(
    projectId: string,
    relayerRegion: string,
    metadata: WalletConnectAppMetadata
  ) {
    super();
    this.projectId = projectId;
    this.relayerRegion = relayerRegion;
    this.metadata = metadata;
  }

  private async initProvider() {
    // if (window) window.global = window;
    this.provider = await UniversalProvider.init({
      logger: DEFAULT_LOGGER,
      relayUrl: this.relayerRegion,
      projectId: this.projectId,
      metadata: this.metadata,
    });

    this.provider.on("display_uri", ({ uri }: { uri: string }) => {
      QRCodeModal.open(uri, (data: any) => {
        console.log("Opened QRCodeModal", data);
      });
    });
  }

  protected async getProvider() {
    if (!this.provider) {
      await this.initProvider();
    }

    return Promise.resolve(this.provider!);
  }

  public async signMessage(message: string) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.request("signMessage", {
      message: encodedMessage,
      format: "utf8",
    });
    const { signature } = signedMessage;

    return { signature };
  }

  public async signTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    const transaction = await this.constructTransaction(type, params);

    console.log({ transaction });

    return "";
  }

  public async signAndSendTransaction<Type extends TransactionType>(
    type: Type,
    params: TransactionArgs[Type]
  ) {
    return await this.sendTransaction(await this.signTransaction(type, params));
  }

  public async connect() {
    const solanaNamespace = {
      solana: {
        chains: Object.keys(solanaClusters).map(
          (clusterId) => `solana:${clusterId}`
        ),
        methods: ["signMessage", "signTransaction"],
        events: [],
        rpcMap: Object.fromEntries(
          Object.entries(solanaClusters).map(([clusterId, clusterVal]) => {
            return [`solana:${clusterId}`, clusterVal.endpoint];
          })
        ),
      },
    };
    const provider = await this.getProvider();
    await provider.connect({
      pairingTopic: undefined,
      namespaces: solanaNamespace,
    });

    return "";
  }
}
