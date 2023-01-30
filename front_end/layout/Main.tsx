import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const Main = ({ children }: Props) => {
  return (
    <div className='container bg-neutral-content text-black rounded-md my-5 p-5'>
      {children}
    </div>
  )
}

export default Main
