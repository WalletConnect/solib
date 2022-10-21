import { getHashedName } from './hash'
import { it, expect, describe } from 'vitest'

describe('Hash', () => {
  it('Hashes as expected', () => {
    const test_name_hash = Buffer.from(
      '386e5fe0deb510513580a0206a20fe893a67ef91322d09aef4b04adab1e1f6f1',
      'hex'
    )
    expect(getHashedName('test_name')).toEqual(test_name_hash)
  })
})
