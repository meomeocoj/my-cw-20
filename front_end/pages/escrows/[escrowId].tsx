import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { EscrowDetail as EscrowDetailComponent } from '../../components'
import { DetailResponse } from '../../contract/Cw20Escrow.types'

const metadata: DetailResponse = {
  arbiter: 'arbiter',
  cw20_balance: [{ address: '1', amount: '1' }],
  cw20_whitelist: ['cw-whitelist'],
  description: 'description',
  end_height: 0,
  id: 'id',
  native_balance: [{ denom: 'stake', amount: '123' }],
  recipient: 'receipient',
  source: 'source',
  title: 'title',
}

export const getStaticPaths: GetStaticPaths = async () => {
  let paths = [{ params: { id: '1' } }, { params: { id: '2' } }]
  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return { props: { metadata }, revalidate: 5 }
}

const EscrowDetail = ({
  metadata,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  console.log(router.query.escrowId)
  if (metadata) {
    return <EscrowDetailComponent metadata={metadata} />
  }
}

export default EscrowDetail
