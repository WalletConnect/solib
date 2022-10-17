import type { Schema } from 'borsh'
import type { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { deserialize } from 'borsh'
import type { Tag } from '../types/splNameService'

export class FavouriteDomain {
  public tag: Tag
  public nameAccount: PublicKey

  public static schema: Schema = new Map([
    [
      FavouriteDomain,
      {
        kind: 'struct',
        fields: [
          ['tag', 'u8'],
          ['nameAccount', [32]]
        ]
      }
    ]
  ])

  public constructor(obj: { tag: number; nameAccount: Uint8Array }) {
    this.tag = obj.tag as Tag
    this.nameAccount = new PublicKey(obj.nameAccount)
  }

  /**
   * This function can be used to deserialize a Buffer into a FavouriteDomain object
   * @param data The buffer to deserialize
   * @returns
   */
  public static deserialize(data: Buffer) {
    return deserialize(this.schema, FavouriteDomain, data)
  }

  /**
   * This function can be used to retrieve and deserialize a favorite domain
   * @param connection The Solana RPC connection object
   * @param key The favorite account key
   * @returns
   */
  public static async retrieve(connection: Connection, key: PublicKey) {
    const accountInfo = await connection.getAccountInfo(key)
    if (!accountInfo) throw new Error('Favourite domain not found')

    return this.deserialize(accountInfo.data)
  }

  /**
   * This function can be used to derive the key of a favorite domain
   * @param programId The name offer program ID
   * @param owner The owner to retrieve the favorite domain for
   * @returns
   */
  public static async getKey(programId: PublicKey, owner: PublicKey) {
    return PublicKey.findProgramAddress(
      [Buffer.from('favourite_domain'), owner.toBuffer()],
      programId
    )
  }
}
