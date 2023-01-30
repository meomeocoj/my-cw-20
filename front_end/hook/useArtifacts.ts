import useSWR from 'swr'
// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json())
export default function useArtifacts(contract: string) {
  const { data: contractArtifact, error } = useSWR(`/api/${contract}`, fetcher)

  return { contractArtifact, error }
}
