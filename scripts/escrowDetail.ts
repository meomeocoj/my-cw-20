import { Cw20EscrowQueryClient } from '../artifacts/contracts/Cw20Escrow.client'

import * as cw20EscrowJson from '../artifacts/contracts/Cw20Escrow.json'
import { config } from '../cosmjs.config'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export async function escrowDetail(id: string) {
  const cc = await CosmWasmClient.connect(config.networks.oraichain_testnet.rpc)
  const escrowQuery = new Cw20EscrowQueryClient(
    cc,
    cw20EscrowJson.networks['Oraichain-testnet']
  )
  const res = await escrowQuery.detail({ id })
  return res
}
