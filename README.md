# Paper Plane Loop

A mobile-first Base Mini App for a tiny onchain flight log. Users connect a
wallet, then call `foldPlane()`, `launchPlane()`, and `landPlane()` on the
`PaperPlaneLoop` contract. There are no tokens, points, fees, invites, or limits
beyond Base gas.

## Stack

- Next.js App Router
- TypeScript
- Wagmi native config
- Viem
- Tailwind CSS

## Required Setup

1. Deploy `contracts/PaperPlaneLoop.sol` on Base.
2. Set the deployed contract address:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd6cc75b5ac6f45a9acba6c79576d3e1943f9a115
```

3. Confirm the hard-coded Base and Talent verification tags in `app/layout.tsx`:

```tsx
<meta name="base:app_id" content="6a252f6095cfa95c11629bb4" />
<meta name="talentapp:project_verification" content="..." />
```

4. After base.dev returns a builder code, set it for ERC-8021 calldata suffixes:

```bash
NEXT_PUBLIC_BASE_BUILDER_CODE=bc_...
```

`lib/wagmi.ts` adds the resulting hex suffix to the Wagmi/Viem client. Every
`writeContract` call in `app/page.tsx` also passes `dataSuffix` explicitly.

## Wallets

The app uses Wagmi native connectors only:

- `injected()` for Base App injected wallet, MetaMask, OKX, and other injected wallets
- `coinbaseWallet()` for Coinbase Wallet

RainbowKit and WalletConnect are not used.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

Before publishing, confirm:

- `app/layout.tsx` contains the correct hard-coded `<meta name="base:app_id">`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` points to the deployed Base contract
- `NEXT_PUBLIC_BASE_BUILDER_CODE` is set after base.dev verification
- Base App, Coinbase Wallet, MetaMask, and OKX can connect
- Fold Plane, Launch Plane, and Land Plane send transactions
- Basescan transaction input data ends with the builder-code suffix
- base.dev Offchain and Onchain dashboards show activity
