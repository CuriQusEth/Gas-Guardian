# Gas Guardian Badge

Gas Guardian Badge is a crypto/Web3 application built on the Monad Testnet that tracks your monthly gas expenditure and rewards you with unlockable achievement badges.

## Overview

The application consists of a smart contract deployed on the Monad Testnet and a modern React-based frontend. It tracks the amount of `MON` you spend on gas and assigns you a tier:

1.  **Gas Saver** – For 0.01 MON gas spent
2.  **Gas Warrior** – For 0.1 MON gas spent
3.  **Gas Legend** – For 1.0+ MON gas spent

## Smart Contract

The `GasGuardianBadge` smart contract is an ERC721 NFT contract that tracks gas spent in `wei` and mints badges when users reach new tiers.

**Contract Address (Monad Testnet):** `0x938513299Dead19554Ad513f06f50EB3De0B8f10`

## Features

-   **Web3 Integration:** Connect your MetaMask wallet to the Monad Testnet.
-   **Gas Tracking:** View your total gas spent in `MON`.
-   **Achievement Badges:** See your current badge level.
-   **Gas Simulation:** A demo button to record 0.05 MON of gas spent to see your tier climb.

## Tech Stack

-   **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React, Motion
-   **Web3:** `ethers` (v5.7.2)
-   **Smart Contract:** Solidity, OpenZeppelin (ERC721)

## Local Development

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Ensure you have MetaMask installed and configured for the Monad Testnet:
   -   **Network Name:** Monad Testnet
   -   **RPC URL:** `https://testnet-rpc.monad.xyz`
   -   **Chain ID:** `10143` (`0x279f`)
   -   **Currency Symbol:** `MON`
   -   **Block Explorer:** `https://testnet.monadexplorer.com`
