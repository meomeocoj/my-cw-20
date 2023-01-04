import { useRouter } from "next/router"
const EscrowDetail = () => {
  const router = useRouter()
  console.log(router.query.escrowId)
  return (
    <div>Detail Escrow {router.query.escrowId}</div>
  )
}

export default EscrowDetail
