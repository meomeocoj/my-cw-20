import { setUp } from './setUp'
import { Cw20BaseClient } from '../artifacts/contracts/Cw20Base.client'
import * as cw20BaseJson from '../artifacts/contracts/Cw20Base.json'
import { config } from '../cosmjs.config'
export async function getTokenInfo() {
  const { signer, cc } = await setUp()
  const cw20Client = new Cw20BaseClient(
    cc,
    signer.address,
    cw20BaseJson.networks[config.networks.oraichain_testnet.chainId]
  )
  const tokenInfo = await cw20Client.tokenInfo()
  return tokenInfo
}

getTokenInfo().catch((err) => {
  console.log(err)
  process.exit(1)
})
