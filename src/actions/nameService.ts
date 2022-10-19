import { Connection, PublicKey } from '@solana/web3.js'
import { getCluster } from '../store'
import { withConnector } from '../utils/connector'

export interface FetchNameArgs {
  address: string
}

export type FetchNameResult = string | null

export async function getSolDomainsFromPublicKey(address: string) {
  return withConnector(async connector => {
    return connector.getSolDomainsFromPublicKey(address)
  })
}

/**
 * Retrieves a domain name to display for a user if any
 * First it attempts to get the favorite domain.
 * This feature doesn't appear to commonly be used hence
 * if none is set we try to capture other domains associated to the
 * account and use the first one that pops up.
 * @param address Base 58 encoded address
 * @returns
 */
export async function fetchName(address: string): Promise<FetchNameResult> {
  return withConnector(async connector => {
    return connector.getFavoriteDomain(address)
  })
}
