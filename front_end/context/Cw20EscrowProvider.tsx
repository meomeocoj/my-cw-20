import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { Cw20EscrowClient } from '../contracts/Cw20Escrow.client'

interface State {
  cw20Client: Cw20EscrowClient | null
}

export const INITIAL_STATE: State = {
  cw20Client: null,
}

const Cw20EscrowContext = createContext({
  state: INITIAL_STATE,
  updateCw20Client: (_data: { cw20EscrowClient: Cw20EscrowClient }) => {},
})

export function useCw20EscrowClient() {
  return useContext(Cw20EscrowContext)
}

interface ProviderProps {
  children: ReactNode
}

const Cw20EscrowProvider: React.FC<ProviderProps> = ({ children }) => {
  const [state, setState] = useState(INITIAL_STATE)

  function updateCw20Client(data: { cw20EscrowClient: Cw20EscrowClient }) {
    setState({ cw20Client: data.cw20EscrowClient })
  }
  return (
    <Cw20EscrowContext.Provider
      value={useMemo(
        () => ({
          state,
          updateCw20Client,
        }),
        [state]
      )}
    >
      {children}
    </Cw20EscrowContext.Provider>
  )
}

export default Cw20EscrowProvider
