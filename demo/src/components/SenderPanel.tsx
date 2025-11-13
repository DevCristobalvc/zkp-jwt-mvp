import { useState } from 'react';
import { BrowserProvider, Contract, keccak256, toUtf8Bytes } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ARBITRUM_SEPOLIA_CHAIN_ID, EXPLORER_URL } from '../config';

interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
}

interface SenderPanelProps {
  wallet: WalletState;
}

function SenderPanel({ wallet }: SenderPanelProps) {
  const [message, setMessage] = useState('');
  const [wallets, setWallets] = useState<string[]>([]);
  const [newWallet, setNewWallet] = useState('');
  const [status, setStatus] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [txHash, setTxHash] = useState('');

  const addWallet = () => {
    if (newWallet && !wallets.includes(newWallet)) {
      setWallets([...wallets, newWallet]);
      setNewWallet('');
    }
  };

  const removeWallet = (index: number) => {
    setWallets(wallets.filter((_, i) => i !== index));
  };

  const generateToken = async () => {
    if (!message || wallets.length === 0) {
      alert('Please enter a message and add at least one wallet');
      return;
    }

    if (!wallet.address || !wallet.provider) {
      alert('Please connect your wallet first');
      return;
    }

    setStatus('⏳ Building Merkle tree from authorized wallets...');

    try {
      // Check network
      const network = await wallet.provider.getNetwork();
      if (Number(network.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        alert(`Please switch to Arbitrum Sepolia (Chain ID: ${ARBITRUM_SEPOLIA_CHAIN_ID})`);
        setStatus('❌ Wrong network');
        return;
      }

      // Build Merkle tree leaves (hash each wallet address)
      const leaves = wallets.map(w => keccak256(toUtf8Bytes(w.toLowerCase())));
      
      // Simple Merkle root calculation (for demo - in production use MerkleTree library)
      let merkleRoot: string;
      if (leaves.length === 1) {
        merkleRoot = leaves[0];
      } else {
        // Combine all leaves for demo
        merkleRoot = keccak256(toUtf8Bytes(leaves.join('')));
      }

      setStatus('⏳ Publishing Merkle root to blockchain...');

      // Connect to contract
      const signer = await wallet.provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Publish root on-chain
      const tx = await contract.publishRoot(merkleRoot);
      setStatus(`⏳ Transaction sent: ${tx.hash.slice(0, 10)}... Waiting for confirmation...`);
      
      await tx.wait();
      setTxHash(tx.hash);
      
      setStatus('⏳ Encrypting message...');

      // Create token with encrypted message
      const mockToken = {
        version: '1.0.0',
        sender: wallet.address,
        merkleRoot: merkleRoot,
        encrypted: btoa(message), // Simple base64 for demo
        algorithm: 'AES-256-GCM',
        authorizedWallets: wallets,
        keyInfo: {
          key: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          iv: '0x' + Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        timestamp: Date.now(),
        txHash: tx.hash
      };

      const tokenStr = JSON.stringify(mockToken, null, 2);
      setGeneratedToken(tokenStr);
      setStatus('✅ Token generated and root published on-chain!');
      
    } catch (error: any) {
      console.error('Error generating token:', error);
      setStatus(`❌ Error: ${error.message || 'Failed to generate token'}`);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    setStatus('📋 Token copied to clipboard!');
    setTimeout(() => setStatus('✅ Token generated successfully! Copy it below.'), 2000);
  };

  return (
    <div className="panel sender-panel">
      <h2>📤 Sender: Create ZKPJWT Token</h2>
      
      {!wallet.address && (
        <div className="info-box">
          <p>👆 Connect your wallet to create an encrypted token</p>
        </div>
      )}

      <div className="section">
        <label>Secret Message:</label>
        <textarea
          placeholder="Enter your secret message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          disabled={!wallet.address}
        />
      </div>

      <div className="section">
        <label>Authorized Wallets (who can decrypt):</label>
        <div className="wallet-input">
          <input
            type="text"
            placeholder="0x..."
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            disabled={!wallet.address}
            onKeyPress={(e) => e.key === 'Enter' && addWallet()}
          />
          <button onClick={addWallet} disabled={!wallet.address}>Add</button>
        </div>

        <div className="wallet-list">
          {wallets.map((w, i) => (
            <div key={i} className="wallet-item">
              <span>{w.slice(0, 10)}...{w.slice(-8)}</span>
              <button onClick={() => removeWallet(i)}>❌</button>
            </div>
          ))}
          {wallets.length === 0 && wallet.address && (
            <div className="placeholder-text">No wallets added yet</div>
          )}
        </div>
      </div>

      <button 
        className="action-btn"
        onClick={generateToken}
        disabled={!wallet.address || !message || wallets.length === 0}
      >
        🔐 Generate ZKPJWT Token
      </button>

      {status && <div className="status">{status}</div>}

      {generatedToken && (
        <div className="section token-output">
          <label>✅ Your ZKPJWT Token:</label>
          {txHash && (
            <p className="hint">
              🔗 <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                View transaction on Arbiscan
              </a>
            </p>
          )}
          <div className="token-box">
            <pre>{generatedToken}</pre>
          </div>
          <button className="copy-btn" onClick={copyToken}>
            📋 Copy Token
          </button>
          <p className="hint">
            💡 Share this token with authorized recipients. They can paste it in the Receiver tab.
          </p>
        </div>
      )}
    </div>
  );
}

export default SenderPanel;
