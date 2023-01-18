import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { GetStaticProps } from 'next'
import path from 'path'
import fs from 'fs'
import { EscrowListItem } from '../components'
import { Cw20EscrowQueryClient } from '../contracts/Cw20Escrow.client'
import { config } from '../cosmjs.config'

export default function Home({ ids }: { ids: string[] }) {
  return (
    <>
      <div className='flex justify-center'>
        <div className='flex flex-col gap-6 md:flex-row md:flex-wrap'>
          {ids.map((id) => (
            <EscrowListItem key={id} id={id} />
          ))}
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const networkConfig = config.networks[process.env.NETWORK]
  const chainId = networkConfig.chainId as string

  const artifactDirectory = path.join(process.cwd(), 'contracts')

  const fileContent = await fs.promises.readFile(
    artifactDirectory + '/Cw20Escrow.json',
    'utf8'
  )
  const cw20EscrowJson = JSON.parse(fileContent)

  const cc = await CosmWasmClient.connect(networkConfig.rpc)
  const escrowQuery = new Cw20EscrowQueryClient(
    cc,
    cw20EscrowJson.networks[chainId]
  )
  const { ids } = await escrowQuery.list()

  return { props: { ids }, revalidate: 5 }
}
