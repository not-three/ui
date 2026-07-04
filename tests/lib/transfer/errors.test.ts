import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { describeTransferError } from "~/lib/transfer/errors";

function axiosErrorWithResponse(status: number, data: unknown): AxiosError {
  const e = new AxiosError("Request failed");
  // @ts-expect-error - partial response object is fine for the test
  e.response = { status, data };
  return e;
}

describe("describeTransferError", () => {
  it("prefers the server-provided message", () => {
    const e = axiosErrorWithResponse(413, { message: "File too large" });
    expect(describeTransferError(e, "Upload failed.")).toBe("File too large");
  });

  it("mentions the status code when there is no message", () => {
    const e = axiosErrorWithResponse(500, {});
    expect(describeTransferError(e, "Upload failed.")).toBe(
      "Upload failed. (Server responded with status 500.)",
    );
  });

  it("explains network errors without a response", () => {
    const e = new AxiosError("Network Error");
    expect(describeTransferError(e, "Upload failed.")).toBe(
      "Upload failed. (No response from the server — check your connection.)",
    );
  });

  it("includes plain Error messages", () => {
    expect(describeTransferError(new Error("Upload crashed"), "Upload failed.")).toBe(
      "Upload failed. (Upload crashed)",
    );
  });

  it("falls back for unknown values", () => {
    expect(describeTransferError("wat", "Upload failed.")).toBe("Upload failed.");
  });
});
