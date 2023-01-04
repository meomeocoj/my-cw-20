import { SigningCosmWasmClient, Secp256k1HdWallet } from "cosmwasm"
import * as secrets from "../secrets.json"
import { config } from "../cosmjs.config"
import { calculateFee, GasPrice } from "@cosmjs/stargate"
import { InstantiateMsg } from "../codegen/Cw20.types"
import * as fs from "fs"
import * as path from "path"

const rpc = config.networks.oraichain_testnet.rpc
const mnemonic = secrets.mnemonic
const orainTestnet = config.networks.oraichain_testnet

async function main() {
  // create wallet
  const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
    prefix: orainTestnet.prefix,
  })
  const [address] = await wallet.getAccounts()
  const wasmPath = path.resolve(
    __dirname,
    "../cw20-base/artifacts/cw20_base-aarch64.wasm"
  )
  // console.log("==> address", address)
  const wasm = fs.readFileSync(wasmPath)
  // using
  const client = await SigningCosmWasmClient.connectWithSigner(rpc, wallet, {
    prefix: orainTestnet.prefix,
    gasPrice: GasPrice.fromString(orainTestnet.gasPrice),
  })
  const uploadFee = calculateFee(0, GasPrice.fromString(orainTestnet.gasPrice))
  console.log("=>uploadFee", uploadFee)
  const uploadResult = await client.upload(address.address, wasm, "auto")
  console.log("==>Codeid", uploadResult.codeId)
  const initMsg: InstantiateMsg = {
    name: "MEOMEOCOJN",
    symbol: "MMC",
    decimals: 6,
    initial_balances: [
      {
        address: address.address,
        amount: "100000",
      },
    ],
    mint: {
      minter: address.address,
      cap: "90000000",
    },
  }

  const contract = await client.instantiate(
    address.address,
    uploadResult.codeId,
    // @ts-ignore
    initMsg,
    "MEME",
    "auto"
  )
  console.log("contract address: ", contract.contractAddress)
}

main().catch((err) => {
  console.log(err)
  process.exit(1)
})
