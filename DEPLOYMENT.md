# Smart Contract Deployment Guide

## Option 1: Deploy with Remix (Recommended for Quick Start)

### Step 1: Prepare Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new file: `ZKPJWTVerifier.sol`
3. Copy contract from `contracts/ZKPJWTVerifier.sol`

### Step 2: Compile

1. Go to "Solidity Compiler" tab
2. Select compiler: `0.8.20+`
3. Click "Compile ZKPJWTVerifier.sol"
4. ✅ Should compile without errors

### Step 3: Deploy to Arbitrum Sepolia

1. Go to "Deploy & Run Transactions" tab
2. Select environment: "Injected Provider - MetaMask"
3. Ensure MetaMask is on Arbitrum Sepolia:
   - Network: Arbitrum Sepolia
   - RPC: `https://sepolia-rollup.arbitrum.io/rpc`
   - Chain ID: `421614`
4. Get testnet ETH: https://faucet.quicknode.com/arbitrum/sepolia
5. Click "Deploy"
6. Confirm transaction in MetaMask
7. 📝 Copy deployed contract address

### Step 4: Verify Contract (Optional)

1. Go to [Arbiscan Sepolia](https://sepolia.arbiscan.io/)
2. Search for your contract address
3. Click "Verify and Publish"
4. Upload flattened source code
5. Select compiler version and license

## Option 2: Deploy with Hardhat

### Setup

```bash
mkdir zkpjwt-contracts && cd zkpjwt-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### Create Deploy Script

`scripts/deploy.js`:
```javascript
async function main() {
  const ZKPJWTVerifier = await ethers.getContractFactory("ZKPJWTVerifier");
  const verifier = await ZKPJWTVerifier.deploy();
  
  await verifier.waitForDeployment();
  
  console.log("✅ ZKPJWTVerifier deployed to:", await verifier.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Configure Networks

`hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

### Deploy

```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

## Option 3: Deploy with Foundry

### Setup

```bash
forge init zkpjwt-contracts
cd zkpjwt-contracts
```

### Copy Contract

```bash
cp ../contracts/ZKPJWTVerifier.sol src/
```

### Build

```bash
forge build
```

### Deploy

```bash
forge create --rpc-url https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $PRIVATE_KEY \
  src/ZKPJWTVerifier.sol:ZKPJWTVerifier
```

## Testing Deployed Contract

### Using Remix

After deployment, test functions in Remix:

1. **publishRoot**
   - Input: `0x94108dbbe346cdfeb216f07c77e6ef76cd70ba7c8306ca274f21cc9f29353551`
   - Click "transact"

2. **rootExists**
   - Input: Same root hash
   - Click "call"
   - Should return: `true`

3. **verifyProof**
   - root: `0x9410...`
   - leaf: `0xc3ac...`
   - proof: `["0x1234...", "0x5678..."]`
   - Should return: `true` if valid

### Using ethers.js

```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  'https://sepolia-rollup.arbitrum.io/rpc'
);

const verifierAddress = '0xYourDeployedContractAddress';
const abi = [...]; // ABI from Remix compilation

const verifier = new ethers.Contract(verifierAddress, abi, provider);

// Check if root exists
const exists = await verifier.rootExists(merkleRoot);
console.log('Root exists:', exists);
```

## Gas Costs (Arbitrum Sepolia)

| Operation | Gas Used | Cost (Gwei) |
|-----------|----------|-------------|
| Deploy Contract | ~800,000 | ~0.0008 ETH |
| Publish Root | ~45,000 | ~0.000045 ETH |
| Verify Proof (depth 4) | ~25,000 | ~0.000025 ETH |
| Unlock Access | ~70,000 | ~0.00007 ETH |

**Note**: Arbitrum has significantly lower gas costs than Ethereum mainnet.

## Contract Addresses

### Testnet Deployments

- **Arbitrum Sepolia**: `0x...` (To be deployed)

### Mainnet (Future)

- **Arbitrum One**: TBD
- **Arbitrum Nova**: TBD

## Integrating with Frontend

Update `demo/src/config.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYourDeployedAddress';
export const CONTRACT_ABI = [
  "function publishRoot(bytes32 root) external",
  "function verifyProof(bytes32 root, bytes32 leaf, bytes32[] proof) public view returns (bool)",
  "function unlockAccess(bytes32 root, bytes32 leaf, bytes32[] proof) external returns (bool)",
  "event AccessGranted(bytes32 indexed root, address indexed accessor, uint256 timestamp)"
];
```

## Monitoring

### View Transactions

- Arbiscan Sepolia: https://sepolia.arbiscan.io/address/YOUR_ADDRESS

### Listen to Events

```javascript
verifier.on("AccessGranted", (root, accessor, timestamp) => {
  console.log(`✅ Access granted to ${accessor}`);
});
```

## Future: Stylus (Rust) Deployment

Coming in Phase 2:

```bash
# Install Cargo Stylus
cargo install cargo-stylus

# Deploy Rust contract
cargo stylus deploy --private-key $PRIVATE_KEY
```

Expected benefits:
- 10x gas reduction
- Native performance
- Advanced ZK verification

## Troubleshooting

### "Out of gas" error
**Solution**: Increase gas limit in MetaMask (try 200,000)

### "Chain ID mismatch"
**Solution**: Ensure MetaMask is on Arbitrum Sepolia (421614)

### "Nonce too low"
**Solution**: Reset MetaMask account in Settings > Advanced > Reset Account

## Support

- 📖 [Arbitrum Deployment Docs](https://docs.arbitrum.io/for-devs/dev-tools-and-resources)
- 💬 Discord: Join #deployment channel
- 🐛 Issues: Report on GitHub

---

**Ready to deploy?** Start with Remix for fastest results! 🚀
