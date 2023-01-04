import { ReactNode } from 'react'
import { Header } from '../components'
import Head from 'next/head'


type Props = {
  children?: ReactNode
  title?: string
}
const Layout = ({ children, title = "Escrow" }: Props) => {
  return (
    <div className="container mx-auto px4">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initital-scale=1.0, width=device-width" />
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  )
}

export default Layout
