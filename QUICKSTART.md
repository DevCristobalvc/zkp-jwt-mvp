# 🚀 Quick Start Guide - ZKPJWT

Get ZKPJWT running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- MetaMask wallet with Arbitrum Sepolia testnet
- Git installed

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/DevCristobalvc/zkp-jwt.git
cd zkp-jwt-library

# Install dependencies
cd library && npm install && cd ..
cd demo && npm install && cd ..
```

## Step 2: Build Library

```bash
cd library
npm run build
```

Expected output:
```
✅ zkpjwt@1.0.0 build
✅ tsc
```

## Step 3: Test Library (Optional)

```bash
node dist/examples.js
```

You should see:
- ✅ Example 1: Encrypted messaging
- ✅ Example 2: Merkle proof generation
- ✅ Example 3: Token-gated content

## Step 4: Run Demo

```bash
cd ../demo
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Step 5: Use the Demo

### Sender Panel

1. Enter a secret message: "Hello ARG25! 🚀"
2. Add authorized wallets:
   - Click "Add" after each address
   - Try: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
3. Click "Generate ZKPJWT Token"

### Receiver Panel

1. Connect MetaMask
2. Click "Verify Access & Decrypt"
3. See decrypted message if authorized ✅

## Common Issues

### MetaMask not detected

**Solution**: Install MetaMask browser extension
- Chrome: https://chrome.google.com/webstore
- Firefox: https://addons.mozilla.org

### Wrong network

**Solution**: Switch to Arbitrum Sepolia
1. Open MetaMask
2. Click network dropdown
3. Add custom network:
   - **Name**: Arbitrum Sepolia
   - **RPC URL**: https://sepolia-rollup.arbitrum.io/rpc
   - **Chain ID**: 421614
   - **Currency**: ETH

### Library not compiling

**Solution**: Check Node.js version
```bash
node --version  # Should be 18+
npm install --legacy-peer-deps  # If conflicts
```

## Next Steps

### Deploy Smart Contract

1. Get testnet ETH from [Arbitrum Sepolia Faucet](https://faucet.quicknode.com/arbitrum/sepolia)
2. Use [Remix IDE](https://remix.ethereum.org):
   - Open `contracts/ZKPJWTVerifier.sol`
   - Compile with Solidity 0.8.20+
   - Deploy to Arbitrum Sepolia

### Publish NPM Package (Optional)

```bash
cd library
npm login
npm publish --access public
```

### Deploy Demo to Netlify

```bash
cd demo
npm run build

# Connect to Netlify
netlify deploy --prod --dir=dist
```

## Architecture Overview

```
zkp-jwt-library/
│
├── library/          ← NPM package (start here)
│   ├── src/
│   │   ├── index.ts       # Core functions
│   │   └── examples.ts    # Usage examples
│   └── dist/              # Compiled JS
│
├── demo/             ← React app
│   └── src/
│       ├── App.tsx
│       └── components/    # Sender/Receiver UI
│
├── contracts/        ← Smart contracts
│   └── ZKPJWTVerifier.sol
│
└── circuits/         ← ZK circuits (Circom)
    └── merkleProof.circom
```

## Key Functions

```typescript
// Create authorized group
const tree = createMerkleTree(['0xAddress1', '0xAddress2']);

// Encrypt message
const { encrypted, key, iv } = encryptMessage("Secret!");

// Generate ZKPJWT token
const token = generateZKPJWT({ encrypted, merkleRoot, keyInfo });

// Verify membership
const isAuthorized = verifyMembership(wallet, tree);

// Decrypt
const message = decryptMessage(encrypted, key, iv);
```

## Video Tutorial

[📺 Watch 2-minute demo](https://youtube.com/...) (Coming soon)

## Support

- 💬 Discord: [Join community](https://discord.gg/zkpjwt)
- 🐛 Issues: [GitHub Issues](https://github.com/DevCristobalvc/zkp-jwt/issues)
- 📧 Email: devcristobalvc@example.com

## What's Next?

Check out:
- [📖 Full Documentation](../README.md)
- [🔧 API Reference](../library/README.md)
- [📜 Smart Contract Guide](../contracts/README.md)
- [⚡ Arbitrum Stylus Version](https://docs.arbitrum.io/stylus)

---

**Built for Arbitrum ARG25** 🚀
