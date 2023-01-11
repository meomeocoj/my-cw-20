import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice, makeCosmoshubPath } from '@cosmjs/stargate'
import { config } from '../cosmjs.config'
import * as secrets from '../secrets.json'

const mnemonic = secrets.mnemonic
const testnet = config.networks.oraichain_testnet

export async function setUp() {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: testnet.prefix,
    hdPaths: [makeCosmoshubPath(0), makeCosmoshubPath(1)],
  })
  const [signer] = await wallet.getAccounts()
  const cc = await SigningCosmWasmClient.connectWithSigner(
    testnet.rpc,
    wallet,
    {
      prefix: testnet.prefix,
      gasPrice: GasPrice.fromString(testnet.gasPrice),
    }
  )
  return { signer, cc, wallet }
}

setUp().catch((err: any) => {
  console.error(err)
  process.exit(1)
})
