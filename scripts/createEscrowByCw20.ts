import { Cw20BaseClient } from '../artifacts/contracts/Cw20Base.client'
import { setUp } from './setUp'
import * as cw20BaseJson from '../artifacts/contracts/Cw20Base.json'
import * as cw20EscrowJson from '../artifacts/contracts/Cw20Escrow.json'
import { toBinary } from '@cosmjs/cosmwasm-stargate'
import { CreateMsg } from '../artifacts/contracts/Cw20Escrow.types'
import { config } from '../cosmjs.config'
import { escrowDetail } from './escrowDetail'

export async function mint() {
  const { signer, cc } = await setUp()
  const cw20Client = new Cw20BaseClient(
    cc,
    signer.address,
    cw20BaseJson.networks[config.networks.oraichain_testnet.chainId]
  )

  const createMsg: CreateMsg = {
    arbiter: signer.address,
    description: 'description',
    id: 'Third Escrow',
    title: 'Escrow for charity',
  }

  const sendMsg = {
    amount: '100',
    contract: cw20EscrowJson.networks['Oraichain-testnet'],
    msg: toBinary({
      create: createMsg,
    }),
  }

  const res = await cw20Client.send(sendMsg)
  console.log({ res })
  const detail = await escrowDetail('Third Escrow')
  console.log({ detail })
}

mint().catch((err) => {
  console.log(err)
  process.exit(1)
})
