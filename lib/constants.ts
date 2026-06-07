import type { Address, Hex } from "viem";

export const appName = "Paper Plane Loop";

export const contractAddress = (process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0xd6cc75b5ac6f45a9acba6c79576d3e1943f9a115") as Address;

export const hasContractAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress);

export const builderCode =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_pgx07w61";

export const attributionDataSuffix = (
  process.env.NEXT_PUBLIC_BASE_ENCODED_STRING ??
  "0x62635f70677830377736310b0080218021802180218021802180218021"
) as Hex;

export const hasAttributionDataSuffix = attributionDataSuffix !== "0x";
