import { DetailResponse } from '../../contracts/Cw20Escrow.types'

const EscrowDetail = ({ metadata }: { metadata: DetailResponse }) => {
  return (
    <div className=''>
      <div className='card'>
        <div className='card-body'>
          <h2 className='card-title'>{metadata.title}</h2>
          <h3>
            {metadata.end_height ? `EndHeight: ${metadata.end_height}` : ''}
          </h3>
          <h3>Source: {metadata.source}</h3>
          <h3>Receipient: {metadata.recipient}</h3>
          <p>Description: {metadata.description}</p>
          <h2>{metadata.native_balance.length > 0 ? `Native Balance` : ''}</h2>
          <div>
            <div className='stats text-primary-content'>
              {metadata.native_balance.map((coin) => {
                return (
                  <div className='stat' key={coin.denom}>
                    <div className='stat-title'>{coin.denom}</div>
                    <div className='stat-value'>{coin.amount}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <h2>{metadata.cw20_balance.length > 0 ? `Cw20 Balance` : ''}</h2>
          <div>
            <div className='stats text-primary-content'>
              {metadata.cw20_balance.map((coin) => {
                return (
                  <div className='stat' key={coin.address}>
                    <div className='stat-title'>{coin.address}</div>
                    <div className='stat-value'>{coin.amount}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className='card-actions justify-end'>
            <button className='btn btn-success'>Approve</button>
            <button className='btn btn-error'>Refund</button>
            <button className='btn btn-warning'>TopUp</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EscrowDetail
