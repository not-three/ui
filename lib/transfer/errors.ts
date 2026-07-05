import { AxiosError } from "axios";

/**
 * Turn any thrown value from an SDK file transfer into a message a user can
 * act on. `fallback` should be a full sentence ending with a period.
 */
export function describeTransferError(e: unknown, fallback: string): string {
  if (e instanceof AxiosError) {
    const data = e.response?.data as { message?: unknown } | undefined;
    if (data?.message) return String(data.message);
    if (e.response)
      return `${fallback} (Server responded with status ${e.response.status}.)`;
    return `${fallback} (No response from the server — check your connection.)`;
  }
  if (e instanceof Error && e.message) return `${fallback} (${e.message})`;
  return fallback;
}
