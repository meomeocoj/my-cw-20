
type NetworkConfig = {
  rpc: string
  chainId: string
  prefix: string
  gasPrice: string
  faucetUrl?: string
  denom: string
}

type networks = {
  [key: string]: NetworkConfig
}

type Config = {
  networks: networks
}

export const contractAddress = "orai1kdh5ej3cth9v46l2jt9had7c4n5p6v54fwx0ll476f3s77ysymnqvmx7vv"

export const config: Config = {
  networks: {
    "oraichain_testnet": {
      rpc: "https://testnet-rpc.orai.io",
      chainId: "Oraichain-testnet",
      denom: "orai",
      prefix: "orai",
      gasPrice: "0.024orai",
    }
  }
}
