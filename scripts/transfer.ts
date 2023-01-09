import { Cw20Client } from '../codegen/Cw20.client'
import { contractAddress } from '../cosmjs.config'
import { setUp } from './setUp'

export async function transfer() {
  const { signer, cc, wallet } = await setUp()
  const [_, receiver] = await wallet.getAccounts()
  console.log({ receiver })
  const cw20Client = new Cw20Client(cc, signer.address, contractAddress)
  const transfer_tx = await cw20Client.transfer({ amount: "10000", recipient: receiver.address })
  console.log({ transfer_tx })
  const balanceReceiver = await cw20Client.balance({ address: receiver.address })
  console.log(balanceReceiver)
  return transfer_tx.transactionHash
}

transfer().catch(err => {
  console.log(err)
  process.exit(1)
})
