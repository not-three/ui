export interface ImageHandoff { blob: Blob; name: string; width: number; height: number }
let pending: ImageHandoff | null = null;
export function putHandoff(value: ImageHandoff) { pending = value; }
export function takeHandoff(): ImageHandoff | null { const value = pending; pending = null; return value; }
