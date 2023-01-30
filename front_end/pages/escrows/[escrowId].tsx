import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { EscrowDetailComponent } from '../../components'
import { config } from '../../cosmjs.config'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Cw20EscrowQueryClient } from '../../contracts/Cw20Escrow.client'
import path from 'path'
import { promises } from 'fs'

export const getStaticPaths: GetStaticPaths = async () => {
  const networkConfig = config.networks[process.env.NETWORK]
  const chainId = networkConfig.chainId as string
  const artifactDirectory = path.join(process.cwd(), 'contracts')
  const fileContent = await promises.readFile(
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
  const paths = ids.map((id) => ({
    params: {
      escrowId: id,
    },
  }))
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const networkConfig = config.networks[process.env.NETWORK]
  const chainId = networkConfig.chainId as string
  const artifactDirectory = path.join(process.cwd(), 'contracts')
  const fileContent = await promises.readFile(
    artifactDirectory + '/Cw20Escrow.json',
    'utf8'
  )
  const cw20EscrowJson = JSON.parse(fileContent)
  const cc = await CosmWasmClient.connect(networkConfig.rpc)
  const escrowQuery = new Cw20EscrowQueryClient(
    cc,
    cw20EscrowJson.networks[chainId]
  )
  const id = params?.escrowId as string
  const detailResponse = await escrowQuery.detail({ id })

  return {
    props: {
      metadata: detailResponse,
    },
    revalidate: 5,
  }
}

const EscrowDetail = ({
  metadata,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  if (metadata != undefined || metadata != null) {
    return <EscrowDetailComponent metadata={metadata} />
  } else {
    return <h1>{router.query.escrowId}</h1>
  }
}

export default EscrowDetail
