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
