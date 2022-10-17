// Copyright 2020 Solana Foundation.

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 */

//     http://www.apache.org/licenses/LICENSE-2.0

/*
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Two modifications were made:
 * * twitter names are not queried
 * * getAllDomains returns max 5 domains
 */

import type { Connection } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { sha256 } from '@ethersproject/sha2'
import BN from 'bn.js'
import {
  HASH_PREFIX,
  NAME_OFFERS_ID,
  NAME_PROGRAM_ID,
  REVERSE_LOOKUP_CLASS,
  ROOT_DOMAIN_ACCOUNT
} from '../constants/splNameService'
import { NameRegistry } from '../utils/nameRegistry'
import { FavouriteDomain } from '../utils/favoriteDomain'

function getHashedName(name: string): Buffer {
  const input = HASH_PREFIX + name
  const str = sha256(Buffer.from(input, 'utf8')).slice(2)

  return Buffer.from(str, 'hex')
}

async function getNameAccountKey(
  hashed_name: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey
): Promise<PublicKey> {
  const seeds = [hashed_name]
  if (nameClass) seeds.push(nameClass.toBuffer())
  else seeds.push(Buffer.alloc(32))

  if (nameParent) seeds.push(nameParent.toBuffer())
  else seeds.push(Buffer.alloc(32))

  const [nameAccountKey] = await PublicKey.findProgramAddress(seeds, NAME_PROGRAM_ID)

  return nameAccountKey
}

export async function performReverseLookup(
  connection: Connection,
  nameAccount: PublicKey
): Promise<string> {
  const hashedReverseLookup = getHashedName(nameAccount.toBase58())
  const reverseLookupAccount = await getNameAccountKey(hashedReverseLookup, REVERSE_LOOKUP_CLASS)

  const { registry } = await NameRegistry.retrieve(connection, reverseLookupAccount)
  if (!registry.data) throw Error('Could not retrieve name data')

  const nameLength = new BN(registry.data.slice(0, 4), 'le').toNumber()

  return `${registry.data.slice(4, 4 + nameLength).toString()}.sol`
}

/**
 * This function can be used to retrieve all domain names owned by `wallet`
 * @param connection The Solana RPC connection object
 * @param wallet The wallet you want to search domain names for
 * @returns
 */
export async function getAllDomains(
  connection: Connection,
  wallet: PublicKey
): Promise<PublicKey[]> {
  const filters = [
    {
      memcmp: {
        offset: 32,
        bytes: wallet.toBase58()
      }
    },
    {
      memcmp: {
        offset: 0,
        bytes: ROOT_DOMAIN_ACCOUNT.toBase58()
      }
    }
  ]
  const accounts = await connection.getProgramAccounts(NAME_PROGRAM_ID, {
    filters
  })

  return accounts.map(a => a.pubkey).slice(0, 5)
}

/**
 * This function can be used to retrieve the favorite domain of a user
 * @param connection The Solana RPC connection object
 * @param owner The owner you want to retrieve the favorite domain for
 * @returns
 */
export async function getFavoriteDomain(connection: Connection, owner: PublicKey) {
  const [favKey] = await FavouriteDomain.getKey(NAME_OFFERS_ID, new PublicKey(owner))
  const favorite = await FavouriteDomain.retrieve(connection, favKey)
  const reverse = await performReverseLookup(connection, favorite.nameAccount)

  return { domain: favorite.nameAccount, reverse }
}
