import type { FileUploadProgress } from "@not3/sdk"

export type UploadRecoveryData = {
  id: string,
  seed: string,
  size: number,
  name: string,
  progress: FileUploadProgress,
  lastModified: number,
}

export function writeRecoveryData(data: Omit<UploadRecoveryData, 'lastModified'> | null) {
  if (!data) localStorage.removeItem('uploadRecovery')
  else localStorage.setItem('uploadRecovery', JSON.stringify({ ...data, lastModified: Date.now() }))
}

export function readRecoveryData(): UploadRecoveryData | null {
  const data = localStorage.getItem('uploadRecovery')
  if (!data) return null
  return JSON.parse(data)
}
