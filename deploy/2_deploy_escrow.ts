import { config } from '../cosmjs.config'
import { calculateFee, GasPrice } from '@cosmjs/stargate'
import { InstantiateMsg } from '../artifacts/contracts/Cw20Escrow.types'
import * as fs from 'fs'
import * as path from 'path'
import { setUp } from '../scripts/setUp'

const orainTestnet = config.networks.oraichain_testnet

async function main() {
  // create wallet
  const { cc: client, wallet } = await setUp()
  const [address] = await wallet.getAccounts()
  const wasmPath = path.resolve(
    __dirname,
    '../artifacts/cw20_escrow-aarch64.wasm'
  )
  // console.log("==> address", address)
  const wasm = fs.readFileSync(wasmPath)
  // upload calculate Fee
  const uploadFee = calculateFee(0, GasPrice.fromString(orainTestnet.gasPrice))
  console.log('=>uploadFee', uploadFee)
  const uploadResult = await client.upload(address.address, wasm, 'auto')
  console.log('==>Codeid', uploadResult.codeId)
  const initMsg: InstantiateMsg = {}

  const contract = await client.instantiate(
    address.address,
    uploadResult.codeId,
    // @ts-ignore
    initMsg,
    'escrow',
    'auto'
  )
  console.log('contract address: ', contract.contractAddress)
}

main().catch((err) => {
  console.log(err)
  process.exit(1)
})
