import { createJiti } from 'jiti'

const jitiInstance = createJiti(import.meta.url, { jsx: true })

export async function importTsx<T = any>(relativePath: string): Promise<T> {
  return (await jitiInstance.import(relativePath)) as T
}
