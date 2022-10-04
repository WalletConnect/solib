import { Connection, PublicKey } from "@solana/web3.js";
import { solanaClusters } from "../defaults/clusters";
import { getFavoriteDomain, getAllDomains, performReverseLookup } from "./spl";

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
  const connection = new Connection(solanaClusters.mainnetBeta.endpoint, 'confirmed');
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
