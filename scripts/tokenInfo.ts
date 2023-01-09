import { setUp } from './setUp'
import { Cw20Client } from '../codegen/Cw20.client'
import { contractAddress } from '../cosmjs.config'

export async function getTokenInfo() {
  const { signer, cc } = await setUp()
  const cw20Client = new Cw20Client(cc, signer.address, contractAddress)
  const tokenInfo = await cw20Client.tokenInfo()
  return tokenInfo
}


getTokenInfo().catch(err => {
  console.log(err)
  process.exit(1)
})
