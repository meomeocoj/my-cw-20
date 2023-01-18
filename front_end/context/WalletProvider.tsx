import { SigningStargateClient } from '@cosmjs/stargate'
import React, {
  createContext,
  ReactNode,
  useContext,
  useReducer,
  useState,
} from 'react'

interface State {
  account: string
  signerClient: SigningStargateClient | null
}

const INITIAL_STATE: State = {
  account: '',
  signerClient: null,
}

const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT'

interface UpdateAcount {
  type: 'UPDATE_ACCOUNT'
  account: string
  signerClient?: SigningStargateClient
}

const WalletContext = createContext({
  state: INITIAL_STATE,
  updateWallet: (_data: {
    account: string
    signerClient?: SigningStargateClient
  }) => {},
})

export function useWeb3Context() {
  return useContext(WalletContext)
}

interface ProviderProps {
  children: ReactNode
}

const WalletProvider: React.FC<ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState('')
  return <WalletContext.Provider value={}>{children}</WalletContext.Provider>
}

export default WalletProvider
