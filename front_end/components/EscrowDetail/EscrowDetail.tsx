import { DetailResponse } from '../../contracts/Cw20Escrow.types'

const EscrowDetail = ({ metadata }: { metadata: DetailResponse }) => {
  return (
    <div className='card w-96 bg-neutral text-neutral-content'>
      <div className='card-body items-center text-center'>
        <h2 className='card-title'>{metadata.title}</h2>
        <p>{metadata.description}</p>
        <div className='card-actions justify-end'>
          <button className='btn btn-primary'>Show Detail</button>
        </div>
      </div>
    </div>
  )
}

export default EscrowDetail
