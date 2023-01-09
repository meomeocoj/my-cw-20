import { Cw20Client } from '../codegen/Cw20.client'
import { contractAddress } from '../cosmjs.config'
import { setUp } from './setUp'
import { getTokenInfo } from './tokenInfo'

export async function mint() {
  const { signer, cc } = await setUp()
  const cw20Client = new Cw20Client(cc, signer.address, contractAddress)
  await cw20Client.mint({ amount: "100000", recipient: signer.address })
  const tokenInfo = await getTokenInfo()
  console.log({ tokenInfo })
  return tokenInfo
}

mint().catch(err => {
  console.log(err)
  process.exit(1)
})
