import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { OWallet } from '@owallet/types'
import { GasPrice } from '@cosmjs/stargate'
import { config } from '../cosmjs.config'
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from 'react'

function getOWallet(): Promise<OWallet | undefined> {
  if (window.owallet) {
    return Promise.resolve(window.owallet)
  }
  if (document.readyState === 'complete') {
    return Promise.resolve(window.owallet)
  }
  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === 'complete'
      ) {
        resolve(window.owallet)
        document.removeEventListener('readystatechange', documentStateChange)
      }
    }
    document.addEventListener('readystatechange', documentStateChange)
  })
}

export async function unlockAccount() {
  const wallet = await getOWallet()
  if (!wallet) {
    alert('Please install owallet extension')
  } else {
    const chainId = config.networks.oraichain_testnet.chainId
    await wallet.enable(chainId)
    const { name, bech32Address: address } = await wallet.getKey(chainId)
    const offlineSigner = await wallet.getOfflineSignerAuto(chainId)
    const signerClient = await SigningCosmWasmClient.connectWithSigner(
      config.networks.oraichain_testnet.rpc,
      offlineSigner,
      { prefix: 'orai', gasPrice: GasPrice.fromString('0.024orai') }
    )
    return { signerClient, address, account: name || '' }
  }
}

export interface State {
  account: string
  address: string
  signerClient: SigningCosmWasmClient | null
}

export const INITIAL_STATE: State = {
  account: '',
  address: '',
  signerClient: null,
}

const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

interface UpdateAcount {
  type: 'UPDATE_ACCOUNT'
  account: string
  address: string
  signerClient?: SigningCosmWasmClient
}

type Action = UpdateAcount

function reducer(state: State, action: Action) {
  switch (action.type) {
    case UPDATE_ACCOUNT: {
      const signerClient = action.signerClient || state.signerClient
      const { account, address } = action

      return {
        ...state,
        signerClient,
        address,
        account,
      }
    }
    default:
      return state
  }
}

const WalletContext = createContext({
  state: INITIAL_STATE,
  updateWallet: (_data: {
    account: string
    address: string
    signerClient?: SigningCosmWasmClient
  }) => {},
})

export function useWeb3Context() {
  return useContext(WalletContext)
}

interface ProviderProps {
  children: ReactNode
}

const WalletProvider: React.FC<ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const updateWallet = (data: {
    account: string
    address: string
    signerClient?: SigningCosmWasmClient
  }) => {
    dispatch({ type: UPDATE_ACCOUNT, ...data })
  }
  return (
    <WalletContext.Provider
      // Only rerender when state update
      value={useMemo(
        () => ({
          state,
          updateWallet,
        }),
        [state]
      )}
    >
      {children}
    </WalletContext.Provider>
  )
}

export default WalletProvider
