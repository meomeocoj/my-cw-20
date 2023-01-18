import { ReactNode } from 'react'
import { Header } from '../components'
import Head from 'next/head'

type Props = {
  children?: ReactNode
  title?: string
}
const Layout = ({ children, title = 'Escrow' }: Props) => {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta charSet='utf-8' />
      </Head>
      <Header />
      <main>
        <div className='container bg-neutral-content text-black rounded-md my-5 p-5'>
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
