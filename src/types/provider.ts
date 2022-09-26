export interface ConnectResponse {
  publicKey: string;
}

export interface Provider {
  connect: () => Promise<ConnectResponse>;
  disconnect: () => void;
}
