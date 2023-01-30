import { useRouter } from 'next/router'

const EscrowListItem = ({ id }: { id: string }) => {
  const router = useRouter()
  const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push(`/escrows/${id}`)
  }
  return (
    <div className='card w-96 bg-neutral text-neutral-content'>
      <div className='card-body items-center text-center'>
        <h2 className='card-title'>{id}</h2>
        <div className='card-actions justify-end'>
          <button onClick={onClickHandler} className='btn btn-primary'>
            Show Detail
          </button>
        </div>
      </div>
    </div>
  )
}

export default EscrowListItem
