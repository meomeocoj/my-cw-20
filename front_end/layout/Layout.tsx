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
      <main>{children}</main>
    </div>
  )
}

export default Layout
