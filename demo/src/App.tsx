import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import './App.css';
import SenderPanel from './components/SenderPanel';
import ReceiverPanel from './components/ReceiverPanel';

interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
}

type Mode = 'sender' | 'receiver';

function App() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, provider: null });
  const [mode, setMode] = useState<Mode>('sender');

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setWallet({ address: accounts[0], provider });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setWallet({ address: null, provider: null });
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔐 ZKPJWT Protocol Demo</h1>
        <p>Privacy-Preserving Access Control with Zero-Knowledge Proofs</p>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'sender' ? 'active' : ''}`}
            onClick={() => switchMode('sender')}
          >
            📤 Sender (Create Token)
          </button>
          <button 
            className={`mode-btn ${mode === 'receiver' ? 'active' : ''}`}
            onClick={() => switchMode('receiver')}
          >
            📥 Receiver (Decrypt)
          </button>
        </div>

        {!wallet.address ? (
          <button onClick={connectWallet} className="connect-btn">
            Connect MetaMask
          </button>
        ) : (
          <div className="wallet-info">
            <span>✅ Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
            <button onClick={disconnectWallet} className="disconnect-btn">
              Disconnect
            </button>
          </div>
        )}
      </header>

      <div className="main-container">
        {mode === 'sender' ? (
          <SenderPanel wallet={wallet} />
        ) : (
          <ReceiverPanel wallet={wallet} />
        )}
      </div>

      <footer className="app-footer">
        <p>Built for Arbitrum ARG25 Program</p>
        <p>
          <a href="https://github.com/DevCristobalvc/zkp-jwt" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' | '}
          <a href="https://docs.arbitrum.io/stylus" target="_blank" rel="noopener noreferrer">
            Arbitrum Stylus
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
