import path from 'path'
import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const artifactDirectory = path.join(process.cwd(), 'contracts')

  const fileContent = await fs.promises.readFile(
    artifactDirectory + 'Cw20Base.json',
    'utf8'
  )

  res.status(200).json(fileContent)
}
