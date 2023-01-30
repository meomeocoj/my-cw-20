import { useCallback, useState } from 'react'
import { INITIAL_STATE } from '../context/WalletProvider'

type AsyncFunction = (...args: any[]) => Promise<any>

const useAsync = (asyncFunction: AsyncFunction) => {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false || null)
  const [data, setData] = useState(INITIAL_STATE)
  const execute = useCallback(async () => {
    setPending(true)
    setError(null)
    asyncFunction()
      .then((res) => {
        setData(res)
        setPending(false)
      })
      .catch((error) => {
        setError(error)
        setPending(false)
      })
  }, [asyncFunction])
  return { pending, error, data, execute }
}

export default useAsync
