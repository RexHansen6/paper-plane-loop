# Paper Plane Loop

Paper Plane Loop is a mobile-first Base Mini App for a tiny onchain flight log.

Users connect a wallet and interact with the `PaperPlaneLoop` contract by calling:

- `foldPlane()`
- `launchPlane()`
- `landPlane()`

The app is intentionally simple.  
There are no points, fees, invites, or app-level limits beyond Base gas.

Repository: https://github.com/RexHansen6/paper-plane-loop.git

## Overview

Paper Plane Loop provides a lightweight interface for recording a small sequence of onchain plane actions.

The experience is designed around three actions:

1. Fold a paper plane.
2. Launch the paper plane.
3. Land the paper plane.

Each action is sent as a transaction to the deployed `PaperPlaneLoop` contract on Base.

## Features

- Mobile-first interface
- Base Mini App metadata support
- Wallet connection through Wagmi native connectors
- Contract writes for folding, launching, and landing a plane
- Viem-based client configuration
- Tailwind CSS styling
- Builder-code suffix support for Base verification

## Stack

- Next.js App Router
- TypeScript
- Wagmi native config
- Viem
- Tailwind CSS

## Contract Setup

Deploy the contract located at:

```text
contracts/PaperPlaneLoop.sol
```

Deploy it on Base, then configure the deployed contract address.

Example:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd6cc75b5ac6f45a9acba6c79576d3e1943f9a115
```

Use the address for your deployed Base contract.

## App Metadata

Confirm the Base and Talent verification tags in `app/layout.tsx`.

Example:

```tsx
<meta name="base:app_id" content="6a252f6095cfa95c11629bb4" />
<meta name="talentapp:project_verification" content="..." />
```

Keep these values aligned with the relevant project verification settings.

## Base Builder Configuration

The Base builder code and ERC-8021 encoded suffix are configured in `lib/constants.ts`.

Example:

```bash
NEXT_PUBLIC_BASE_BUILDER_CODE=bc_pgx07w61
NEXT_PUBLIC_BASE_ENCODED_STRING=0x62635f70677830377736310b0080218021802180218021802180218021
```

The Wagmi/Viem client in `lib/wagmi.ts` adds the encoded suffix.

Each `writeContract` call in `app/page.tsx` also passes `dataSuffix` explicitly.

## Wallet Support

The app uses Wagmi native connectors only.

Supported connector setup:

- `injected()` for Base App injected wallet, MetaMask, OKX, and other injected wallets
- `coinbaseWallet()` for Coinbase Wallet

RainbowKit is not used.

WalletConnect is not used.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Usage

1. Open the app.
2. Connect a supported wallet.
3. Select **Fold Plane** to call `foldPlane()`.
4. Select **Launch Plane** to call `launchPlane()`.
5. Select **Land Plane** to call `landPlane()`.
6. Confirm each transaction in your wallet.

The app sends each action directly to the configured `PaperPlaneLoop` contract.

## Verification Commands

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Pre-Publish Checklist

Before publishing, confirm the following:

- `app/layout.tsx` contains the correct hard-coded `<meta name="base:app_id">`
- `NEXT_PUBLIC_CONTRACT_ADDRESS` points to the deployed Base contract
- `NEXT_PUBLIC_BASE_BUILDER_CODE` is set after base.dev verification
- Base App can connect
- Coinbase Wallet can connect
- MetaMask can connect
- OKX can connect
- **Fold Plane** sends a transaction
- **Launch Plane** sends a transaction
- **Land Plane** sends a transaction
- Basescan transaction input data ends with the builder-code suffix
