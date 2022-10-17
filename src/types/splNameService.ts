/**
 * Account tags (used for deserialization on-chain)
 */
export enum Tag {
  Uninitialized = 0,
  ActiveOffer = 1,
  CancelledOffer = 2,
  AcceptedOffer = 3,
  FavouriteDomain = 4,
  FixedPriceOffer = 5,
  AcceptedFixedPriceOffer = 6,
  CancelledFixedPriceOffer = 7
}
