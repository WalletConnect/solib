export interface PublicKey {
  length: number;
  negative: number;
  words: Array<number>;
  toString: () => string;
}

export interface ConnectResponse {
  publicKey: PublicKey;
}

export interface Provider {
  connect: () => Promise<ConnectResponse>;
  disconnect: () => void;
}
