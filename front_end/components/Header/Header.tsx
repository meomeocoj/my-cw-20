import Image from 'next/image'
import oraichain from '../../public/oraichain-pro.svg'
const Header = () => {
  return (
    <div className='container navbar bg-neutral-content'>
      <button className='btn btn-active btn-link '>
        <Image src={oraichain} height={40} width={130} alt='' />
      </button>
      <div className='flex-1'>
        <a className='btn btn-ghost normal-case text-xl'>Escrow</a>
      </div>
      <div className='flex-none gap-2'>
        <div className='dropdown dropdown-end'>
          <label tabIndex={0} className='btn btn-xs sm:btn-sm md:btn-md'>
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
