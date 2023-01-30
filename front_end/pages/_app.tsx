import type { AppProps } from 'next/app'
import '../styles/globals.css'
import Layout from '../layout/Layout'
import WalletProvider from '../context/WalletProvider'
import Cw20EscrowProvider from '../context/Cw20EscrowProvider'
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Cw20EscrowProvider>
        <WalletProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WalletProvider>
      </Cw20EscrowProvider>
    </>
  )
}
