# Smart Contracts for ZKPJWT

## ZKPJWTVerifier.sol

Solidity smart contract for verifying Merkle membership proofs on-chain.

### Features

- **Publish Merkle Roots**: Store authorized group roots
- **Verify Proofs**: On-chain Merkle proof verification
- **Access Control**: Grant/deny access based on proof validity
- **Event Logging**: Transparent audit trail

### Functions

#### `publishRoot(bytes32 root)`
Publishes a Merkle root for an authorized group.

#### `verifyProof(bytes32 root, bytes32 leaf, bytes32[] proof)`
Pure function to verify a Merkle proof.

#### `unlockAccess(bytes32 root, bytes32 leaf, bytes32[] proof)`
Verifies proof and grants access, emitting events.

### Events

- `RootPublished(bytes32 root, address publisher, uint256 timestamp)`
- `AccessGranted(bytes32 root, address accessor, uint256 timestamp)`
- `AccessDenied(bytes32 root, address accessor, uint256 timestamp)`

## Deployment

### Using Remix

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create `ZKPJWTVerifier.sol` and paste the contract
3. Compile with Solidity 0.8.20+
4. Deploy to Arbitrum Sepolia:
   - Network: Arbitrum Sepolia
   - RPC: https://sepolia-rollup.arbitrum.io/rpc
   - Chain ID: 421614

### Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

npx hardhat compile
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

### Using Foundry

```bash
forge install
forge build
forge create --rpc-url $ARBITRUM_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  src/ZKPJWTVerifier.sol:ZKPJWTVerifier
```

## Future: Stylus (Rust) Version

For production, this will be rewritten in Rust for Arbitrum Stylus to achieve:
- 10x gas reduction
- Native performance
- Advanced ZK verification

Example Rust structure:
```rust
#[solidity_storage]
pub struct ZKPJWTVerifier {
    roots: StorageMap<U256, RootMetadata>,
}

impl ZKPJWTVerifier {
    pub fn verify_proof(&self, root: U256, proof: Vec<U256>) -> bool {
        // Stylus verification logic
    }
}
```

## Testing

```bash
# Unit tests
npm test

# Integration tests with local fork
npm run test:fork
```
