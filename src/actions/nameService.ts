import { Connection, PublicKey } from "@solana/web3.js";
import { sha256 } from "@ethersproject/sha2";
import { deserializeUnchecked, Schema, deserialize } from "borsh";
import BN from "bn.js";

export type FetchNameArgs = {
  address: string
}

export type FetchNameResult = string | null

/**
* Retrieves a domain name to display for a user if any
* First it attempts to get the favorite domain.
* This feature doesn't appear to commonly be used hence
* if none is set we try to capture other domains associated to the
* account and use the first one that pops up.
* @param connection The Solana RPC connection object
* @param owner The owner you want to retrieve the favorite domain for
* @returns
*/
export async function fetchName(args: FetchNameArgs): Promise<FetchNameResult> {
  const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/6PX0-A50M0FvqrjQ8HKPFEAWWscpGWkF', 'confirmed');
  const address = new PublicKey(args.address);

  try {
    return (await getFavoriteDomain(connection, address)).reverse;
  } catch (e) {}

  const otherDomains = await getSolDomainsFromPublicKey(connection, address);

  return otherDomains.length > 0 ? otherDomains[0] : null;
}

async function getSolDomainsFromPublicKey(connection: Connection, wallet: PublicKey):Promise<string[]>{
  const allDomainKeys = await getAllDomains(connection, wallet);
  const allDomainNames = await Promise.all(allDomainKeys.map((key: PublicKey) => {
    return performReverseLookup(connection, key)
  }));
  return allDomainNames;
}

/**
 * Account tags (used for deserialization on-chain)
 */
enum Tag {
  Uninitialized = 0,
  ActiveOffer = 1,
  CancelledOffer = 2,
  AcceptedOffer = 3,
  FavouriteDomain = 4,
  FixedPriceOffer = 5,
  AcceptedFixedPriceOffer = 6,
  CancelledFixedPriceOffer = 7,
}

/**
 * Hash prefix used to derive domain name addresses
 */
const HASH_PREFIX = "SPL Name Service";

const NAME_OFFERS_ID = new PublicKey(
  "85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29"
);

/**
 * The `.sol` TLD
 */
const ROOT_DOMAIN_ACCOUNT = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);

/**
 * The Solana Name Service program ID
 */
const NAME_PROGRAM_ID = new PublicKey(
  "namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX"
);

/**
 * The reverse look up class
 */
const REVERSE_LOOKUP_CLASS = new PublicKey(
  "33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z"
);

class FavouriteDomain {
  tag: Tag;
  nameAccount: PublicKey;

  static schema: Schema = new Map([
    [
      FavouriteDomain,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["nameAccount", [32]],
        ],
      },
    ],
  ]);

  constructor(obj: { tag: number; nameAccount: Uint8Array }) {
    this.tag = obj.tag as Tag;
    this.nameAccount = new PublicKey(obj.nameAccount);
  }

  /**
   * This function can be used to deserialize a Buffer into a FavouriteDomain object
   * @param data The buffer to deserialize
   * @returns
   */
  static deserialize(data: Buffer) {
    return deserialize(this.schema, FavouriteDomain, data);
  }

  /**
   * This function can be used to retrieve and deserialize a favorite domain
   * @param connection The Solana RPC connection object
   * @param key The favorite account key
   * @returns
   */
  static async retrieve(connection: Connection, key: PublicKey) {
    const accountInfo = await connection.getAccountInfo(key);
    if (!accountInfo || !accountInfo.data) {
      throw new Error("Favourite domain not found");
    }
    return this.deserialize(accountInfo.data);
  }

  /**
   * This function can be used to derive the key of a favorite domain
   * @param programId The name offer program ID
   * @param owner The owner to retrieve the favorite domain for
   * @returns
   */
  static async getKey(programId: PublicKey, owner: PublicKey) {
    return await PublicKey.findProgramAddress(
      [Buffer.from("favourite_domain"), owner.toBuffer()],
      programId
    );
  }
}

class NameRegistryState {
  static HEADER_LEN = 96;
  parentName: PublicKey;
  owner: PublicKey;
  class: PublicKey;
  data: Buffer | undefined;

  static schema: Schema = new Map([
    [
      NameRegistryState,
      {
        kind: "struct",
        fields: [
          ["parentName", [32]],
          ["owner", [32]],
          ["class", [32]],
        ],
      },
    ],
  ]);
  constructor(obj: {
    parentName: Uint8Array;
    owner: Uint8Array;
    class: Uint8Array;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.owner = new PublicKey(obj.owner);
    this.class = new PublicKey(obj.class);
  }

  public static async retrieve(
    connection: Connection,
    nameAccountKey: PublicKey
  ) {
    const nameAccount = await connection.getAccountInfo(nameAccountKey);
    if (!nameAccount) {
      throw new Error("Invalid name account provided");
    }

    let res: NameRegistryState = deserializeUnchecked(
      this.schema,
      NameRegistryState,
      nameAccount.data
    );

    res.data = nameAccount.data?.slice(this.HEADER_LEN);

    return { registry: res };
  }

  static async _retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[]
  ) {
    const nameAccounts = await connection.getMultipleAccountsInfo(
      nameAccountKeys
    );
    const fn = (data: Buffer | undefined) => {
      if (!data) return undefined;
      const res: NameRegistryState = deserializeUnchecked(
        this.schema,
        NameRegistryState,
        data
      );
      res.data = data?.slice(this.HEADER_LEN);
      return res;
    };
    return nameAccounts.map((e) => fn(e?.data));
  }

  public static async retrieveBatch(
    connection: Connection,
    nameAccountKeys: PublicKey[]
  ) {
    let result: (NameRegistryState | undefined)[] = [];
    while (nameAccountKeys.length > 0) {
      result.push(
        ...(await this._retrieveBatch(
          connection,
          nameAccountKeys.splice(0, 100)
        ))
      );
    }
    return result;
  }
}

async function getHashedName(name: string): Promise<Buffer> {
  const input = HASH_PREFIX + name;
  const str = sha256(Buffer.from(input, "utf8")).slice(2);
  return Buffer.from(str, "hex");
}

async function getNameAccountKey(
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey
): Promise<PublicKey> {
  const seeds = [hashed_name];
  if (nameClass) {
    seeds.push(nameClass.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  if (nameParent) {
    seeds.push(nameParent.toBuffer());
  } else {
    seeds.push(Buffer.alloc(32));
  }
  const [nameAccountKey] = await PublicKey.findProgramAddress(
    seeds,
    NAME_PROGRAM_ID
  );
  return nameAccountKey;
}

async function performReverseLookup(
  connection: Connection,
  nameAccount: PublicKey
): Promise<string> {
  const hashedReverseLookup = await getHashedName(nameAccount.toBase58());
  const reverseLookupAccount = await getNameAccountKey(
    hashedReverseLookup,
    REVERSE_LOOKUP_CLASS
  );

  const { registry } = await NameRegistryState.retrieve(
    connection,
    reverseLookupAccount
  );
  if (!registry.data) {
    throw "Could not retrieve name data";
  }
  const nameLength = new BN(registry.data.slice(0, 4), "le").toNumber();
  return registry.data.slice(4, 4 + nameLength).toString() + ".sol";
}

/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
async function getAllDomains(
  connection: Connection,
  wallet: PublicKey
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: wallet.toBase58(),
      },
    },
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58(),
      },
    },
  ];
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters,
  });
  
  return accounts.map((a) => a.pubkey).slice(0, 5);
}

/**
 * This function can be used to retrieve the favorite domain of a user
 * @param connection The Solana RPC connection object
 * @param owner The owner you want to retrieve the favorite domain for
 * @returns
 */
const getFavoriteDomain = async (
  connection: Connection,
  owner: PublicKey
) => {
  const [favKey] = await FavouriteDomain.getKey(
    NAME_OFFERS_ID,
    new PublicKey(owner)
  );
  const favorite = await FavouriteDomain.retrieve(connection, favKey);
  const reverse = await performReverseLookup(connection, favorite.nameAccount);

  return { domain: favorite.nameAccount, reverse };
};
