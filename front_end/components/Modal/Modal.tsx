import React, { ReactNode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

interface Props {
  show: boolean
  children: ReactNode
}

const Modal = ({ show, children }: Props) => {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const modalContent = show ? (
    <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center bg-base opacity-100'>
      <div className='modal-box'>{children}</div>
    </div>
  ) : null

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') as HTMLElement
    )
  } else {
    return null
  }
}

export default Modal
