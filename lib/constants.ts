import type { Address, Hex } from "viem";
import { stringToHex } from "viem";

export const appName = "Paper Plane Loop";

export const contractAddress = (process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0x3Da427df87bBD6CE3B7ed3aB8F7c7977136173CA") as Address;

export const hasContractAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress);

const builderCode = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "";

export const attributionDataSuffix = (
  builderCode ? stringToHex(builderCode) : "0x"
) as Hex;

export const hasAttributionDataSuffix = attributionDataSuffix !== "0x";
