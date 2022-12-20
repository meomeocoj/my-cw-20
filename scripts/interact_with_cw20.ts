import { Cw20Client } from "../codegen/Cw20.client"
import { SigningCosmWasmClient, Secp256k1HdWallet } from "cosmwasm"
import { GasPrice } from "@cosmjs/stargate"
import { config } from "../cosmjs.config"
import * as secrets from "../secrets.json"
const contractAddress = "orai1kdh5ej3cth9v46l2jt9had7c4n5p6v54fwx0ll476f3s77ysymnqvmx7vv"

const mnemonic = secrets.mnemonic
const testnet = config.networks.oraichain_testnet

async function main() {

  const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: testnet.prefix })

  const [signer] = await wallet.getAccounts()
  const client = await SigningCosmWasmClient.connectWithSigner(testnet.rpc, wallet, {
    prefix: testnet.prefix,
    gasPrice: GasPrice.fromString(testnet.gasPrice)
  })
  const cw20Client = new Cw20Client(client, signer.address, contractAddress)

  const minter = await cw20Client.minter()

  console.log(minter)

  const balanceMiner = await cw20Client.balance({ address: signer.address })
  console.log(balanceMiner)
  cw20Client.balance({ address: signer.address })
}

main().catch(err => {
  console.log(err)
  process.exit(1)
})
