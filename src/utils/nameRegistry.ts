import type { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import type { Schema } from 'borsh'
import { deserializeUnchecked } from 'borsh'

export class NameRegistry {
  private static readonly HEADER_LEN = 96
  public parentName: PublicKey
  public owner: PublicKey
  public class: PublicKey
  public data: Buffer | undefined

  protected static schema: Schema = new Map([
    [
      NameRegistry,
      {
        kind: 'struct',
        fields: [
          ['parentName', [32]],
          ['owner', [32]],
          ['class', [32]]
        ]
      }
    ]
  ])
  public constructor(obj: { parentName: Uint8Array; owner: Uint8Array; class: Uint8Array }) {
    this.parentName = new PublicKey(obj.parentName)
    this.owner = new PublicKey(obj.owner)
    this.class = new PublicKey(obj.class)
  }

  public static async retrieveBatch(connection: Connection, nameAccountKeys: PublicKey[]) {
    const nameAccounts = await connection.getMultipleAccountsInfo(nameAccountKeys)
    const fn = (data: Buffer | undefined) => {
      if (!data) return undefined
      const res: NameRegistry = deserializeUnchecked(this.schema, NameRegistry, data)
      res.data = data.slice(this.HEADER_LEN)

      return res
    }

    return nameAccounts.map(e => fn(e?.data))
  }
}
