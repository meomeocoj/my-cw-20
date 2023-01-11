import { setUp } from './setUp'
import { CreateMsg } from '../artifacts/contracts/Cw20Escrow.types'
import { Cw20EscrowClient } from '../artifacts/contracts/Cw20Escrow.client'

import * as cw20EscrowJson from '../artifacts/contracts/Cw20Escrow.json'
import * as cw20 from '../artifacts/contracts/Cw20Base.json'
import { config } from '../cosmjs.config'
import { escrowDetail } from './escrowDetail'

export async function createEscrow() {
  const { signer, cc } = await setUp()
  const cw20Escrow = new Cw20EscrowClient(
    cc,
    signer.address,
    cw20EscrowJson.networks[config.networks.oraichain_testnet.chainId]
  )
  const createMsg: CreateMsg = {
    arbiter: signer.address,
    cw20_whitelist: [cw20.networks['Oraichain-testnet']],
    description: 'description',
    id: 'Second Escrow',
    title: 'Escrow for charity',
  }

  const res = await cw20Escrow.create(
    //@ts-ignore
    createMsg,
    'auto',
    '',
    [{ denom: 'orai', amount: '1' }]
  )

  console.log(res)

  const detail = await escrowDetail('Second Escrow')
  console.log(detail)
}

createEscrow().catch((err) => {
  console.log(err)
  process.exit(1)
})
