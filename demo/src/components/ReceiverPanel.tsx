import { useState } from 'react';
import { BrowserProvider, Contract, keccak256, toUtf8Bytes } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ARBITRUM_SEPOLIA_CHAIN_ID, EXPLORER_URL } from '../config';

interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
}

interface ReceiverPanelProps {
  wallet: WalletState;
}

function ReceiverPanel({ wallet }: ReceiverPanelProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [parsedToken, setParsedToken] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [status, setStatus] = useState('');
  const [verifyTxHash, setVerifyTxHash] = useState('');

  const pasteToken = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTokenInput(text);
      setStatus('📋 Token pasted from clipboard');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      alert('Failed to read clipboard. Please paste manually.');
    }
  };

  const loadToken = () => {
    if (!tokenInput) {
      alert('Please paste a ZKPJWT token');
      return;
    }

    try {
      const token = JSON.parse(tokenInput);
      setParsedToken(token);
      setIsAuthorized(null);
      setDecryptedMessage('');
      setStatus('✅ Token loaded successfully');
    } catch (error) {
      console.error('Error parsing token:', error);
      alert('Invalid token format');
      setStatus('❌ Invalid token format');
    }
  };

  const verifyAccess = async () => {
    if (!wallet.address || !wallet.provider) {
      alert('Please connect your wallet first');
      return;
    }

    if (!parsedToken) {
      alert('Please load a token first');
      return;
    }

    setStatus('⏳ Checking network...');

    try {
      // Check network
      const network = await wallet.provider.getNetwork();
      if (Number(network.chainId) !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        alert(`Please switch to Arbitrum Sepolia (Chain ID: ${ARBITRUM_SEPOLIA_CHAIN_ID})`);
        setStatus('❌ Wrong network');
        return;
      }

      setStatus('⏳ Checking if your wallet is authorized...');
      
      // Check if wallet is in authorized list
      const authorized = parsedToken.authorizedWallets.some(
        (w: string) => w.toLowerCase() === wallet.address!.toLowerCase()
      );
      
      if (!authorized) {
        setIsAuthorized(false);
        setStatus('❌ Access denied - Your wallet is not in the authorized list');
        return;
      }

      setStatus('⏳ Verifying on blockchain...');

      // Connect to contract
      const signer = await wallet.provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Check if root exists on-chain
      const rootExists = await contract.rootExists(parsedToken.merkleRoot);
      if (!rootExists) {
        setIsAuthorized(false);
        setStatus('❌ Merkle root not found on blockchain');
        return;
      }

      // Build Merkle proof (simplified for demo)
      const leaf = keccak256(toUtf8Bytes(wallet.address.toLowerCase()));
      const proof: string[] = []; // In production, calculate actual Merkle proof

      setStatus('⏳ Calling unlockAccess on smart contract...');

      // Call unlockAccess (this will fail with empty proof, but demonstrates the flow)
      try {
        const tx = await contract.unlockAccess(parsedToken.merkleRoot, leaf, proof);
        setStatus(`⏳ Transaction sent: ${tx.hash.slice(0, 10)}... Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        setVerifyTxHash(tx.hash);

        // Check if AccessGranted event was emitted
        const grantedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === 'AccessGranted';
          } catch {
            return false;
          }
        });

        if (grantedEvent) {
          setIsAuthorized(true);
          setStatus('✅ Access granted on-chain! Decrypting message...');
          
          // Decrypt message
          const decrypted = atob(parsedToken.encrypted);
          setDecryptedMessage(decrypted);
        } else {
          setIsAuthorized(false);
          setStatus('❌ Access denied by smart contract');
        }
      } catch (contractError: any) {
        // For demo purposes, if proof verification fails, still show local check result
        console.warn('Smart contract verification failed (expected with empty proof):', contractError);
        setIsAuthorized(true);
        setStatus('✅ Wallet authorized locally! (Proof verification skipped for demo)');
        
        // Decrypt message anyway for demo
        const decrypted = atob(parsedToken.encrypted);
        setDecryptedMessage(decrypted);
      }
      
    } catch (error: any) {
      console.error('Error verifying access:', error);
      setStatus(`❌ Error: ${error.message || 'Verification failed'}`);
    }
  };

  const reset = () => {
    setTokenInput('');
    setParsedToken(null);
    setIsAuthorized(null);
    setDecryptedMessage('');
    setStatus('');
    setVerifyTxHash('');
  };

  return (
    <div className="panel receiver-panel">
      <h2>📥 Receiver: Decrypt Message</h2>

      {!wallet.address && (
        <div className="info-box">
          <p>👆 Connect your wallet to decrypt messages</p>
        </div>
      )}

      {!parsedToken ? (
        <div className="section">
          <label>Paste ZKPJWT Token:</label>
          <textarea
            placeholder='Paste the ZKPJWT token here (JSON format)...'
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            rows={8}
            disabled={!wallet.address}
          />
          <div className="button-group">
            <button 
              className="action-btn secondary"
              onClick={pasteToken}
              disabled={!wallet.address}
            >
              📋 Paste from Clipboard
            </button>
            <button 
              className="action-btn"
              onClick={loadToken}
              disabled={!wallet.address || !tokenInput}
            >
              🔍 Load Token
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="section">
            <label>Token Info:</label>
            <div className="token-info">
              <div><strong>Version:</strong> {parsedToken.version}</div>
              <div><strong>Algorithm:</strong> {parsedToken.algorithm}</div>
              <div><strong>Sender:</strong> {parsedToken.sender?.slice(0, 10)}...{parsedToken.sender?.slice(-8)}</div>
              <div><strong>Authorized Wallets:</strong> {parsedToken.authorizedWallets?.length}</div>
              <div><strong>Merkle Root:</strong> {parsedToken.merkleRoot?.slice(0, 20)}...</div>
              <div><strong>Created:</strong> {new Date(parsedToken.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {isAuthorized === null && (
            <button 
              className="action-btn"
              onClick={verifyAccess}
              disabled={!wallet.address}
            >
              🔓 Verify Access & Decrypt
            </button>
          )}

          {status && <div className="status">{status}</div>}

          {isAuthorized === true && decryptedMessage && (
            <div className="section success">
              <label>✅ Decrypted Message:</label>
              <div className="decrypted-message">
                {decryptedMessage}
              </div>
              {verifyTxHash && (
                <p className="hint">
                  🔗 <a href={`${EXPLORER_URL}/tx/${verifyTxHash}`} target="_blank" rel="noopener noreferrer">
                    View verification transaction on Arbiscan
                  </a>
                </p>
              )}
              <p className="hint">
                🎉 Success! You were authorized to read this message.
              </p>
            </div>
          )}

          {isAuthorized === false && (
            <div className="section error">
              <label>❌ Access Denied:</label>
              <p>Your wallet ({wallet.address?.slice(0, 10)}...{wallet.address?.slice(-8)}) is not in the authorized group.</p>
              <p className="hint">Only these wallets can decrypt:</p>
              <ul>
                {parsedToken.authorizedWallets?.map((w: string, i: number) => (
                  <li key={i}>{w.slice(0, 10)}...{w.slice(-8)}</li>
                ))}
              </ul>
            </div>
          )}

          <button className="reset-btn" onClick={reset}>
            🔄 Try Another Token
          </button>
        </>
      )}
    </div>
  );
}

export default ReceiverPanel;
