import React, { useRef, useState } from 'react'
import { useCw20EscrowClient } from '../../context/Cw20EscrowProvider'
import { DetailResponse } from '../../contracts/Cw20Escrow.types'
import Modal from '../Modal/Modal'

const EscrowDetailComponent = ({ metadata }: { metadata: DetailResponse }) => {
  const {
    state: { cw20Client },
  } = useCw20EscrowClient()
  const recipientRef = useRef<HTMLInputElement>(null)

  const [showRecipient, setShowRecipient] = useState(false)
  const [showTopup, setShowTopup] = useState(false)
  const [showAccept, setShowAccept] = useState(false)
  const onSetRecipient = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const result = await cw20Client?.setReceipient(
        {
          id: metadata.id,
          recipient: recipientRef.current?.value as string,
        },
        'auto'
      )
    } catch (error) {
      console.error(error)
    }
  }

  const onApprove = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      const result = await cw20Client?.approve({ id: metadata.id })
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className='card container my-6 p-5'>
      <div className='card-body'>
        <h2 className='card-title'>{metadata.title}</h2>
        <h3>
          {metadata.end_height ? `EndHeight: ${metadata.end_height}` : ''}
        </h3>
        <h3>Source: {metadata.source}</h3>
        <h3>Recipient: {metadata.recipient}</h3>
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
          {metadata.recipient ? (
            <button className='btn btn-success' onClick={onApprove}>
              Approve
            </button>
          ) : (
            <button
              className='btn btn-success'
              onClick={() => {
                setShowRecipient(true)
              }}
            >
              Set Recipient
            </button>
          )}
          <button className='btn btn-error'>Refund</button>
          <button className='btn btn-warning'>TopUp</button>
        </div>
      </div>
      {/*Modal set receipient */}
      <Modal show={showRecipient}>
        <h3 className='text-lg font-bold'>Set Recipient</h3>
        <label className='label'>Recipient</label>
        <input
          ref={recipientRef}
          type='text'
          className='input input-bordered w-full max-w-xs'
        />
        <div className='modal-action'>
          <button className='btn btn-success' onClick={onSetRecipient}>
            Set
          </button>
          <button
            className='btn'
            onClick={() => {
              setShowRecipient(false)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default EscrowDetailComponent
