# Circom Circuits for ZKPJWT

This directory contains Zero-Knowledge circuits for verifying Merkle membership proofs.

## Circuit: `merkleProof.circom`

Verifies that a wallet address is part of an authorized group without revealing which specific member.

### Inputs

**Public:**
- `root` - Merkle tree root (published on-chain)

**Private:**
- `leaf` - Hashed wallet address
- `pathIndices` - Array indicating left (0) or right (1) at each level
- `siblings` - Merkle proof sibling hashes

### Parameters

- `levels` - Tree depth (default: 4, supports up to 16 members)

## Compilation (If using real ZK)

```bash
# Install circom
npm install -g circom

# Compile circuit
circom merkleProof.circom --r1cs --wasm --sym

# Generate witness
node generate_witness.js merkleProof.wasm input.json witness.wtns

# Generate proof (with setup)
snarkjs groth16 prove merkleProof_final.zkey witness.wtns proof.json public.json
```

## Note for MVP

For the demo, we're simulating ZK verification in the smart contract using Merkle tree verification directly. This circuit demonstrates the design but isn't compiled for the MVP due to time constraints.

In production, this would be compiled and the verifier code would be integrated into the Stylus contract.
