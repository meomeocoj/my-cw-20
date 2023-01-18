import Image from 'next/image'
import { useRouter } from 'next/router'
const Header = () => {
  const router = useRouter()
  const onLogoHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.replace('/')
  }
  return (
    <div className='container navbar bg-neutral-content'>
      <button
        className='btn btn-active btn-link absolute w-[200px] h-full'
        onClick={onLogoHandler}
      >
        <div className='relative w-[200px] h-[200px] top-1 right-10'>
          <Image src='/image2vector.svg' fill={true} alt='' />
        </div>
      </button>
      <div className='flex-1'>
        <a className='btn btn-ghost normal-case text-xl'>Escrow</a>
      </div>
      <div className='flex-none gap-2'>
        <div className='dropdown dropdown-end'>
          <label tabIndex={0} className='btn btn-sm sm:btn-sm md:btn-md'>
            Connect
          </label>
          <ul
            tabIndex={0}
            className='mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52'
          >
            <li>
              <a>Disconnect</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Header
