import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCw20EscrowClient } from '../../context/Cw20EscrowProvider'
import { unlockAccount, useWeb3Context } from '../../context/WalletProvider'
import { Cw20EscrowClient } from '../../contracts/Cw20Escrow.client'
import useAsync from '../../hook/useAsync'
const Header = () => {
  const { state, updateWallet } = useWeb3Context()
  const { updateCw20Client } = useCw20EscrowClient()

  const { pending, error, data, execute } = useAsync(unlockAccount)

  const onClickConnect = async (event: React.MouseEvent<HTMLLabelElement>) => {
    event.preventDefault()
    execute()
    if (error) {
      console.log(error)
    }
    if (data && data.signerClient) {
      updateWallet({
        account: data.account,
        address: data.address,
        signerClient: data?.signerClient,
      })
      const cw20EscrowClient = new Cw20EscrowClient(
        data.signerClient,
        data.address,
        process.env.ESCROW_ADDRESS
      )
      updateCw20Client({ cw20EscrowClient })
    }
  }

  const onDisconnect = async (event: React.MouseEvent) => {
    event.preventDefault()
    updateWallet({ address: '', account: '' })
  }
  const router = useRouter()
  const onLogoHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.replace('/')
  }

  return (
    <div className='container navbar bg-neutral-content'>
      <button
        className='btn btn-active btn-link absolute w-[200px] h-[40px]'
        onClick={onLogoHandler}
      >
        <div className='relative w-[200px] h-[138px] bottom-10 right-10'>
          <Image src='/image2vector.svg' fill={true} alt='' priority={true} />
        </div>
      </button>
      <div className='flex-1'>
        <a className='btn btn-ghost normal-case text-xl'>Escrow</a>
      </div>
      <div className='flex-none gap-2'>
        <div className='dropdown dropdown-end'>
          <label
            tabIndex={0}
            onClick={onClickConnect}
            className={`btn btn-sm ${
              pending ? 'loading disabled' : ''
            } sm:btn-sm md:btn-md`}
          >
            {state.account ? state.account : `Connect`}
          </label>
          {state.account && (
            <ul
              tabIndex={0}
              className='mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52'
            >
              <li onClick={onDisconnect}>
                <a>Disconnect</a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Header
