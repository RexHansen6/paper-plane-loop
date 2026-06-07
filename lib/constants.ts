import type { Address, Hex } from "viem";
import { stringToHex } from "viem";

export const appName = "Paper Plane Loop";

export const contractAddress = (process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0xd6cc75b5ac6f45a9acba6c79576d3e1943f9a115") as Address;

export const hasContractAddress = /^0x[a-fA-F0-9]{40}$/.test(contractAddress);

const builderCode = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "";

export const attributionDataSuffix = (
  builderCode ? stringToHex(builderCode) : "0x"
) as Hex;

export const hasAttributionDataSuffix = attributionDataSuffix !== "0x";
