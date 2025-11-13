import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';

/**
 * ZKPJWT Token Structure
 */
export interface ZKPJWTToken {
  version: string;
  merkleRoot: string;
  encrypted: string;
  algorithm: string;
  keyInfo: {
    key: string;
    iv: string;
  };
  timestamp: number;
}

/**
 * Encrypted Message Data
 */
export interface EncryptedData {
  encrypted: string;
  key: Buffer;
  iv: Buffer;
}

/**
 * Merkle Proof Data
 */
export interface MerkleProof {
  leaf: string;
  proof: string[];
  root: string;
  verified: boolean;
}

/**
 * Creates a Merkle Tree from a list of Ethereum wallet addresses
 * @param wallets - Array of Ethereum addresses
 * @returns MerkleTree instance
 */
export function createMerkleTree(wallets: string[]): MerkleTree {
  // Normalize addresses to lowercase and hash them
  const leaves = wallets.map(addr => keccak256(addr.toLowerCase()));
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  
  return tree;
}

/**
 * Get Merkle Root as hex string
 * @param tree - MerkleTree instance
 * @returns Merkle root as hex string
 */
export function getMerkleRoot(tree: MerkleTree): string {
  return tree.getRoot().toString('hex');
}

/**
 * Encrypts a message using AES-256-GCM
 * @param message - Plain text message to encrypt
 * @returns Encrypted data with key and IV
 */
export function encryptMessage(message: string): EncryptedData {
  const key = randomBytes(32); // 256-bit key
  const iv = randomBytes(16);  // 128-bit IV
  
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag for GCM mode
  const authTag = cipher.getAuthTag();
  encrypted += authTag.toString('hex');
  
  return {
    encrypted,
    key,
    iv
  };
}

/**
 * Decrypts an encrypted message
 * @param encrypted - Encrypted hex string (includes auth tag)
 * @param key - Encryption key
 * @param iv - Initialization vector
 * @returns Decrypted plain text
 */
export function decryptMessage(encrypted: string, key: Buffer, iv: Buffer): string {
  // Extract auth tag (last 32 hex chars = 16 bytes)
  const authTag = Buffer.from(encrypted.slice(-32), 'hex');
  const encryptedText = encrypted.slice(0, -32);
  
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a ZKPJWT token
 * @param data - Token data including encrypted message and merkle root
 * @returns ZKPJWT token as JSON string
 */
export function generateZKPJWT(data: {
  encrypted: string;
  merkleRoot: string;
  keyInfo: { key: string; iv: string };
}): string {
  const token: ZKPJWTToken = {
    version: '1.0.0',
    merkleRoot: data.merkleRoot,
    encrypted: data.encrypted,
    algorithm: 'AES-256-GCM',
    keyInfo: data.keyInfo,
    timestamp: Date.now()
  };
  
  return JSON.stringify(token, null, 2);
}

/**
 * Parses a ZKPJWT token
 * @param token - ZKPJWT token string
 * @returns Parsed token object
 */
export function parseZKPJWT(token: string): ZKPJWTToken {
  return JSON.parse(token) as ZKPJWTToken;
}

/**
 * Verifies if a wallet is a member of the Merkle tree
 * @param wallet - Ethereum address to verify
 * @param tree - MerkleTree instance
 * @returns true if wallet is in the tree
 */
export function verifyMembership(wallet: string, tree: MerkleTree): boolean {
  const leaf = keccak256(wallet.toLowerCase());
  const root = tree.getRoot();
  const proof = tree.getProof(leaf);
  
  return tree.verify(proof, leaf, root);
}

/**
 * Generates a Merkle proof for a specific wallet
 * @param wallet - Ethereum address
 * @param tree - MerkleTree instance
 * @returns Merkle proof data
 */
export function generateProof(wallet: string, tree: MerkleTree): MerkleProof {
  const leaf = keccak256(wallet.toLowerCase());
  const proof = tree.getProof(leaf);
  const root = tree.getRoot();
  
  return {
    leaf: leaf.toString('hex'),
    proof: proof.map(p => p.data.toString('hex')),
    root: root.toString('hex'),
    verified: tree.verify(proof, leaf, root)
  };
}

/**
 * Verifies a Merkle proof against a root
 * @param proof - Merkle proof data
 * @param root - Expected Merkle root
 * @returns true if proof is valid
 */
export function verifyProof(proof: MerkleProof, root: string): boolean {
  return proof.root === root && proof.verified;
}

/**
 * Hash a wallet address (compatible with smart contract)
 * @param wallet - Ethereum address
 * @returns Keccak256 hash as hex string
 */
export function hashWallet(wallet: string): string {
  return keccak256(wallet.toLowerCase()).toString('hex');
}

/**
 * Compute Merkle root from leaves (for verification)
 * @param leaves - Array of leaf hashes
 * @returns Merkle root as hex string
 */
export function computeMerkleRoot(leaves: string[]): string {
  const leafBuffers = leaves.map(leaf => Buffer.from(leaf, 'hex'));
  const tree = new MerkleTree(leafBuffers, keccak256, { sortPairs: true });
  return tree.getRoot().toString('hex');
}

// Re-export types
export { MerkleTree };
