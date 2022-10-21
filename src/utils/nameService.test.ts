import { PublicKey } from '@solana/web3.js'
import borsh from 'borsh'
import { it, expect, describe } from 'vitest'
import { FavouriteDomain, NameRegistry } from './nameService'

describe('Name Service Deserialization', () => {
  it('Deserializes FavoriteDomain', () => {
    const data = Buffer.from('BLApIgAlSdcOwQ23hBihSUmdd1ENXMpBLf4r8haMtAB4', 'base64')
    const result = {
      tag: 4,
      nameAccount: new PublicKey('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb')
    }

    expect(borsh.deserialize(FavouriteDomain.schema, FavouriteDomain, data)).toEqual(result)
  })

  it('Deserializes NameRegistry', () => {
    const data = Buffer.from(
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAebFjksbVKKFvPFD7mp4g1bvqG4lnz2KsWavQO9itJjh5sWOSxtUooW88UPuaniDVu+obiWfPYqxZq9A72K0mOBwAAAGJvbmZpZGEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      'base64'
    )
    const result = {
      class: new PublicKey('33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z'),
      owner: new PublicKey('33m47vH6Eav6jr5Ry86XjhRft2jRBLDnDgPSHoquXi2Z'),
      parentName: new PublicKey('11111111111111111111111111111111'),
      data: undefined
    }

    expect(borsh.deserializeUnchecked(NameRegistry.schema, NameRegistry, data)).toEqual(result)
  })
})
