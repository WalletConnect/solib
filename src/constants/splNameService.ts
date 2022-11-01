import { PublicKey } from '@solana/web3.js'

/**
 * Hash prefix used to derive domain name addresses
 */
export const HASH_PREFIX = 'SPL Name Service'

export const NAME_OFFERS_ID = new PublicKey('85iDfUvr3HJyLM2zcq5BXSiDvUWfw6cSE1FfNBo8Ap29')

/**
 * The `.sol` TLD
 */
export const ROOT_DOMAIN_ACCOUNT = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')

/**
 * The Solana Name Service program ID
 */
export const NAME_PROGRAM_ID = new PublicKey('namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX')

/**
 * The reverse look up class
 */
export const REVERSE_LOOKUP_CLASS = new PublicKey('33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z')

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

/**
 * Mainnet program ID
 */
export const NAME_TOKENIZER_ID = new PublicKey('nftD3vbNkNqfj2Sd3HZwbpw4BxxKWr4AjGb9X38JeZk')

export const MINT_PREFIX = Buffer.from('tokenized_name')
