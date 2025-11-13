# 🔐 ZKPJWT - Zero-Knowledge Proof JSON Web Token

Privacy-preserving access control library using Zero-Knowledge Proofs and Merkle Trees.

## 🚀 Installation

```bash
npm install zkpjwt
```

## 📖 Usage

### Basic Example - Encrypted Group Messaging

```typescript
import { createMerkleTree, encryptMessage, generateZKPJWT, verifyMembership } from 'zkpjwt';

// 1. Sender: Create authorized group
const authorizedWallets = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
];

const merkleTree = createMerkleTree(authorizedWallets);
const merkleRoot = merkleTree.getRoot().toString('hex');

// 2. Encrypt message
const secretMessage = "Hello, authorized members only!";
const { encrypted, key, iv } = encryptMessage(secretMessage);

// 3. Generate ZKPJWT token
const zkpjwt = generateZKPJWT({
  encrypted,
  merkleRoot,
  keyInfo: { key: key.toString('hex'), iv: iv.toString('hex') }
});

console.log('ZKPJWT Token:', zkpjwt);

// 4. Receiver: Verify membership and decrypt
const receiverWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const isAuthorized = verifyMembership(receiverWallet, merkleTree);

if (isAuthorized) {
  const decrypted = decryptMessage(encrypted, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  console.log('Decrypted:', decrypted);
}
```

## 🔑 Core Functions

### `createMerkleTree(wallets: string[])`
Creates a Merkle tree from a list of Ethereum addresses.

### `encryptMessage(message: string)`
Encrypts a message using AES-256-GCM. Returns `{ encrypted, key, iv }`.

### `generateZKPJWT(data: ZKPJWTData)`
Generates a ZKPJWT token containing encrypted data and Merkle root.

### `verifyMembership(wallet: string, merkleTree: MerkleTree)`
Verifies if a wallet is part of the authorized group.

### `generateProof(wallet: string, merkleTree: MerkleTree)`
Generates a Merkle proof for on-chain verification.

## 🏗️ Architecture

```
┌─────────────┐
│   Sender    │
│  (Encrypt)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Merkle Tree (R)   │
│ [wallet1, wallet2]  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   ZKPJWT Token      │
│ {msg, root, key}    │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  Receiver   │
│  (Verify)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Smart Contract     │
│  verify_proof(π,R)  │
└─────────────────────┘
```

## 🛡️ Security Features

- **AES-256-GCM Encryption**: Military-grade symmetric encryption
- **Merkle Tree Proofs**: Efficient membership verification
- **Zero-Knowledge Ready**: Compatible with Circom circuits
- **On-Chain Verification**: Stylus (Rust) or Solidity contracts

## 📦 Use Cases

- **Private Group Messaging**: Encrypted messages for authorized members
- **Token-Gated Content**: Prove token ownership without revealing balance
- **Credential Verification**: Prove qualifications without exposing data
- **DAO Voting**: Anonymous voting with membership proof

## 🔗 Resources

- [GitHub Repository](https://github.com/DevCristobalvc/zkp-jwt)
- [Arbitrum Stylus Docs](https://docs.arbitrum.io/stylus)
- [Circom Documentation](https://docs.circom.io/)

## 📄 License

MIT © DevCristobalvc
