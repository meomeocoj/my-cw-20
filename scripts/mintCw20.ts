import { Cw20BaseClient } from '../artifacts/contracts/Cw20Base.client'
import { setUp } from './setUp'
import { getTokenInfo } from './tokenInfo'
import * as cw20BaseJson from '../artifacts/contracts/Cw20Base.json'
import { config } from '../cosmjs.config'

export async function mint() {
  const { signer, cc } = await setUp()
  const cw20Client = new Cw20BaseClient(
    cc,
    signer.address,
    cw20BaseJson.networks[config.networks.oraichain_testnet.chainId]
  )

  await cw20Client.mint({ amount: '100000', recipient: signer.address })
  const tokenInfo = await getTokenInfo()
  console.log({ tokenInfo })
  return tokenInfo
}

mint().catch((err) => {
  console.log(err)
  process.exit(1)
})
