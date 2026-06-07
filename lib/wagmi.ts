import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { attributionDataSuffix } from "@/lib/constants";

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "Paper Plane Loop",
      preference: "all",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
  dataSuffix: attributionDataSuffix,
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
