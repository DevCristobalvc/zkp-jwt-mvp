# 🧪 ZKPJWT - Testing Guide

**Date**: November 12, 2025  
**Contract**: 0xf935f364f797AF2336FfDb3ee06431e1616B7c6C  
**Network**: Arbitrum Sepolia (421614)  
**Demo**: http://localhost:5174/

---

## ✅ Pre-Testing Checklist

Before starting, ensure you have:

- [ ] MetaMask installed and configured
- [ ] Arbitrum Sepolia network added to MetaMask
- [ ] Test ETH in your wallet (get from [Arbitrum faucet](https://faucet.quicknode.com/arbitrum/sepolia))
- [ ] Demo server running: `cd demo && npm run dev`
- [ ] Browser at http://localhost:5174/

### Add Arbitrum Sepolia to MetaMask

```
Network Name: Arbitrum Sepolia
RPC URL: https://sepolia-rollup.arbitrum.io/rpc
Chain ID: 421614
Currency Symbol: ETH
Block Explorer: https://sepolia.arbiscan.io
```

---

## 🎯 Test Scenario 1: Happy Path (Authorized User)

### **Goal**: Test full flow with authorized wallet

### **Steps**:

#### 1. Connect Wallet (Sender)
- [ ] Click "Connect Wallet" button
- [ ] MetaMask opens → Click "Connect"
- [ ] Verify wallet address shows in header
- [ ] Verify you're on "Sender" tab

#### 2. Create Encrypted Token
- [ ] Enter secret message: `"Secret: The treasure is at coordinates 42.3601, -71.0589"`
- [ ] Click "Add" authorized wallet
- [ ] Add YOUR OWN wallet address (copy from MetaMask)
- [ ] Click "Generate ZKPJWT Token"
- [ ] MetaMask opens asking to sign transaction
- [ ] Confirm transaction (gas ~0.0001 ETH)

#### 3. Wait for Confirmation
- [ ] Status shows: "⏳ Transaction sent: 0x..."
- [ ] Wait ~3-5 seconds
- [ ] Status changes to: "✅ Token generated and root published on-chain!"
- [ ] Token JSON appears below
- [ ] Transaction link appears
- [ ] Click "Copy Token" button

#### 4. Switch to Receiver Mode
- [ ] Click "📥 Receiver" tab
- [ ] Click "Disconnect" if needed
- [ ] Connect same wallet again (or stay connected)

#### 5. Verify and Decrypt
- [ ] Click "📋 Paste from Clipboard" (or paste manually)
- [ ] Token appears in textarea
- [ ] Click "🔍 Load Token"
- [ ] Token info displays (version, sender, merkle root, etc.)
- [ ] Click "🔓 Verify Access & Decrypt"
- [ ] MetaMask opens for verification transaction
- [ ] Confirm transaction

#### 6. Check Results
- [ ] Status shows: "✅ Wallet authorized locally!"
- [ ] Decrypted message appears: "Secret: The treasure is at coordinates 42.3601, -71.0589"
- [ ] Success message with green background
- [ ] Transaction link to Arbiscan appears (if on-chain verification worked)

#### 7. Verify on Blockchain
- [ ] Click transaction link (opens Arbiscan)
- [ ] Verify transaction status: Success ✅
- [ ] Check "Logs" tab
- [ ] Look for events:
  - `RootPublished` (from sender)
  - `AccessGranted` or `AccessDenied` (from receiver)

---

## 🚫 Test Scenario 2: Sad Path (Unauthorized User)

### **Goal**: Verify access denial for non-authorized wallet

### **Steps**:

#### 1. Create Token (Sender)
- [ ] Connect wallet
- [ ] Enter message: `"Top secret data"`
- [ ] Add DIFFERENT wallet address (not your own)
  - Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
- [ ] Generate token and confirm transaction
- [ ] Copy generated token

#### 2. Try to Access (Unauthorized Wallet)
- [ ] Switch to Receiver tab
- [ ] Paste the token
- [ ] Load token
- [ ] Click "Verify Access & Decrypt"

#### 3. Expected Results
- [ ] Status shows: "❌ Access denied - Your wallet is not in the authorized list"
- [ ] Red error box appears
- [ ] Shows list of authorized wallets (NOT your address)
- [ ] NO decrypted message shown
- [ ] If blockchain call was made, event shows `AccessDenied`

---

## 🔄 Test Scenario 3: Multiple Authorized Wallets

### **Goal**: Test with multiple wallets in authorization list

### **Steps**:

1. Create token with 3 wallets:
   - [ ] Your main wallet
   - [ ] `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`
   - [ ] `0x1234567890123456789012345678901234567890`

2. Verify with your wallet:
   - [ ] Should succeed ✅

3. (Optional) Try with different wallet:
   - [ ] Switch MetaMask account
   - [ ] Should fail if not in list ❌

---

## 🌐 Test Scenario 4: Network Validation

### **Goal**: Test network switching validation

### **Steps**:

1. Switch to wrong network:
   - [ ] Open MetaMask
   - [ ] Switch to Ethereum Mainnet (or any other network)
   - [ ] Try to generate token
   - [ ] Should show alert: "Please switch to Arbitrum Sepolia (Chain ID: 421614)"

2. Switch back to Arbitrum Sepolia:
   - [ ] Open MetaMask
   - [ ] Switch to Arbitrum Sepolia
   - [ ] Token generation should work ✅

---

## 🔍 Blockchain Verification Checklist

For each transaction, verify on Arbiscan:

### Published Root Transaction
- [ ] **URL**: https://sepolia.arbiscan.io/tx/[YOUR_TX_HASH]
- [ ] Status: Success ✅
- [ ] Function Called: `publishRoot`
- [ ] Event Emitted: `RootPublished`
- [ ] Event Parameters:
  - `root`: bytes32 (Merkle root)
  - `publisher`: address (your wallet)
  - `timestamp`: uint256

### Verification Transaction
- [ ] **URL**: https://sepolia.arbiscan.io/tx/[YOUR_TX_HASH]
- [ ] Status: Success ✅
- [ ] Function Called: `unlockAccess`
- [ ] Event Emitted: `AccessGranted` OR `AccessDenied`
- [ ] Event Parameters:
  - `root`: bytes32
  - `accessor`: address (your wallet)
  - `timestamp`: uint256

---

## 📊 Gas Cost Analysis

Record actual gas costs from your tests:

| Operation | Expected Gas | Actual Gas | Cost (ETH) |
|-----------|--------------|------------|------------|
| publishRoot | ~45,000 | _______ | ~0.0001 |
| unlockAccess (success) | ~55,000 | _______ | ~0.0001 |
| unlockAccess (fail) | ~30,000 | _______ | ~0.00007 |

---

## 🐛 Common Issues & Solutions

### Issue 1: MetaMask doesn't open
- **Solution**: Refresh page, ensure MetaMask is unlocked

### Issue 2: Transaction fails
- **Solution**: Check you have enough ETH for gas
- **Solution**: Verify you're on Arbitrum Sepolia network

### Issue 3: "Root not found" error
- **Solution**: Wait for publishRoot transaction to confirm before verifying
- **Solution**: Check transaction status on Arbiscan

### Issue 4: Demo won't load
- **Solution**: Ensure dev server is running: `npm run dev`
- **Solution**: Check port 5174 is not blocked by firewall

### Issue 5: Copy/Paste doesn't work
- **Solution**: Grant clipboard permissions in browser
- **Solution**: Copy manually (Ctrl+C / Cmd+C)

---

## ✅ Testing Completion Checklist

- [ ] Happy path works end-to-end
- [ ] Unauthorized access is properly denied
- [ ] All transactions confirm on Arbiscan
- [ ] Events are emitted correctly
- [ ] Network validation works
- [ ] UI shows clear status messages
- [ ] No console errors in browser
- [ ] Gas costs are reasonable
- [ ] Token copy/paste works smoothly

---

## 📝 Test Report Template

**Tester**: _______________  
**Date**: _______________  
**Wallet Used**: 0x_______________

### Results:
- [ ] ✅ All tests passed
- [ ] ⚠️ Some issues found (document below)
- [ ] ❌ Critical failures

### Issues Found:
1. _______________________________
2. _______________________________
3. _______________________________

### Screenshots/Evidence:
- Transaction 1: https://sepolia.arbiscan.io/tx/_______________
- Transaction 2: https://sepolia.arbiscan.io/tx/_______________

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ Mark TICKET-005 as complete
2. 🦀 Move to TICKET-003: Stylus (Rust) implementation
3. 📹 Record demo video (optional but recommended)
4. 🚀 Prepare final submission

---

**Ready to test?** Open http://localhost:5174/ and start with Scenario 1! 🚀
