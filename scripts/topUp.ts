import { setUp } from './setUp'
import { Cw20EscrowClient } from '../artifacts/contracts/Cw20Escrow.client'

import * as cw20EscrowJson from '../artifacts/contracts/Cw20Escrow.json'
import { config } from '../cosmjs.config'
import { escrowDetail } from './escrowDetail'

export async function topUp() {
  const { signer, cc } = await setUp()
  const cw20Escrow = new Cw20EscrowClient(
    cc,
    signer.address,
    cw20EscrowJson.networks[config.networks.oraichain_testnet.chainId]
  )

  const res = await cw20Escrow.topUp({ id: 'Second Escrow' }, 'auto', '', [
    {
      denom: 'orai',
      amount: '1',
    },
  ])

  console.log(res)

  const detail = await escrowDetail('Second Escrow')
  console.log(detail)
}

topUp().catch((err) => {
  console.log(err)
  process.exit(1)
})
