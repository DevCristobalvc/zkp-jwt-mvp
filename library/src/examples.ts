import {
  createMerkleTree,
  getMerkleRoot,
  encryptMessage,
  decryptMessage,
  generateZKPJWT,
  parseZKPJWT,
  verifyMembership,
  generateProof,
  verifyProof
} from './index';

/**
 * Example 1: Basic Encrypted Group Messaging
 */
function basicExample() {
  console.log('\n🔐 Example 1: Basic Encrypted Group Messaging\n');
  
  // Step 1: Create authorized group
  const authorizedWallets = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
  ];
  
  console.log('📋 Authorized Wallets:', authorizedWallets);
  
  // Step 2: Build Merkle Tree
  const merkleTree = createMerkleTree(authorizedWallets);
  const merkleRoot = getMerkleRoot(merkleTree);
  
  console.log('🌳 Merkle Root:', merkleRoot);
  
  // Step 3: Encrypt message
  const secretMessage = "Hello, authorized members only! 🎉";
  const { encrypted, key, iv } = encryptMessage(secretMessage);
  
  console.log('🔒 Message Encrypted');
  console.log('   Key:', key.toString('hex').substring(0, 32) + '...');
  console.log('   Encrypted:', encrypted.substring(0, 32) + '...');
  
  // Step 4: Generate ZKPJWT Token
  const zkpjwt = generateZKPJWT({
    encrypted,
    merkleRoot,
    keyInfo: {
      key: key.toString('hex'),
      iv: iv.toString('hex')
    }
  });
  
  console.log('\n📦 ZKPJWT Token Generated:');
  console.log(zkpjwt);
  
  // Step 5: Receiver verifies membership
  const receiverWallet = authorizedWallets[0];
  const isAuthorized = verifyMembership(receiverWallet, merkleTree);
  
  console.log('\n✅ Verification:');
  console.log(`   Receiver: ${receiverWallet}`);
  console.log(`   Authorized: ${isAuthorized}`);
  
  // Step 6: Decrypt if authorized
  if (isAuthorized) {
    const parsedToken = parseZKPJWT(zkpjwt);
    const decrypted = decryptMessage(
      parsedToken.encrypted,
      Buffer.from(parsedToken.keyInfo.key, 'hex'),
      Buffer.from(parsedToken.keyInfo.iv, 'hex')
    );
    
    console.log('\n🔓 Decrypted Message:', decrypted);
  }
}

/**
 * Example 2: Merkle Proof Generation
 */
function proofExample() {
  console.log('\n\n🌲 Example 2: Merkle Proof Generation\n');
  
  const wallets = [
    '0xAlice111111111111111111111111111111111111',
    '0xBob2222222222222222222222222222222222222',
    '0xCarol333333333333333333333333333333333333',
    '0xDave444444444444444444444444444444444444'
  ];
  
  const tree = createMerkleTree(wallets);
  const root = getMerkleRoot(tree);
  
  console.log('📋 Group Members:', wallets.length);
  console.log('🌳 Root:', root);
  
  // Generate proof for Bob
  const bobWallet = wallets[1];
  const proof = generateProof(bobWallet, tree);
  
  console.log('\n🔍 Proof for Bob:');
  console.log('   Leaf:', proof.leaf.substring(0, 16) + '...');
  console.log('   Proof Length:', proof.proof.length, 'siblings');
  console.log('   Verified:', proof.verified);
  
  // Verify proof
  const isValid = verifyProof(proof, root);
  console.log('   Proof Valid:', isValid);
  
  // Try with unauthorized wallet
  const eveWallet = '0xEve5555555555555555555555555555555555555';
  const isEveMember = verifyMembership(eveWallet, tree);
  console.log('\n❌ Unauthorized wallet (Eve):', isEveMember);
}

/**
 * Example 3: Token-Gated Content
 */
function tokenGatedExample() {
  console.log('\n\n🎫 Example 3: Token-Gated Content Access\n');
  
  // Premium subscribers
  const premiumSubscribers = [
    '0xPremium1111111111111111111111111111111111',
    '0xPremium2222222222222222222222222222222222',
    '0xPremium3333333333333333333333333333333333'
  ];
  
  const tree = createMerkleTree(premiumSubscribers);
  const root = getMerkleRoot(tree);
  
  const premiumContent = "🎬 Exclusive Video: How to Build ZK Apps";
  const { encrypted, key, iv } = encryptMessage(premiumContent);
  
  const zkpjwt = generateZKPJWT({
    encrypted,
    merkleRoot: root,
    keyInfo: {
      key: key.toString('hex'),
      iv: iv.toString('hex')
    }
  });
  
  console.log('📺 Premium Content Protected');
  console.log('👥 Authorized Subscribers:', premiumSubscribers.length);
  console.log('🔐 Token:', zkpjwt.substring(0, 100) + '...');
  
  // Premium user access
  const premiumUser = premiumSubscribers[0];
  if (verifyMembership(premiumUser, tree)) {
    const token = parseZKPJWT(zkpjwt);
    const content = decryptMessage(
      token.encrypted,
      Buffer.from(token.keyInfo.key, 'hex'),
      Buffer.from(token.keyInfo.iv, 'hex')
    );
    console.log('\n✅ Access Granted:', content);
  }
  
  // Free user denied
  const freeUser = '0xFreeUser111111111111111111111111111111111';
  if (!verifyMembership(freeUser, tree)) {
    console.log('\n❌ Free user access denied');
  }
}

// Run all examples
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════');
  console.log('        ZKPJWT Library - Usage Examples');
  console.log('═══════════════════════════════════════════════════');
  
  basicExample();
  proofExample();
  tokenGatedExample();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ All examples completed successfully!');
  console.log('═══════════════════════════════════════════════════\n');
}

export {
  basicExample,
  proofExample,
  tokenGatedExample
};
