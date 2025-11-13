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
        <div className="header-top">
          <div className="logo-section">
            <img src="/arbitrum-logo.svg" alt="Arbitrum" className="arbitrum-logo" />
            <div className="title-group">
              <h1>ZKPJWT Protocol</h1>
              <p className="subtitle">Privacy-Preserving Access Control</p>
            </div>
          </div>
          
          {!wallet.address ? (
            <button onClick={connectWallet} className="connect-btn">
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <div className="wallet-address">
                <span className="status-dot"></span>
                <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
              </div>
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'sender' ? 'active' : ''}`}
            onClick={() => switchMode('sender')}
          >
            Sender
          </button>
          <button 
            className={`mode-btn ${mode === 'receiver' ? 'active' : ''}`}
            onClick={() => switchMode('receiver')}
          >
            Receiver
          </button>
        </div>
      </header>

      <div className="main-container">
        {mode === 'sender' ? (
          <SenderPanel wallet={wallet} />
        ) : (
          <ReceiverPanel wallet={wallet} />
        )}
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <img src="/arbitrum-logo.svg" alt="Arbitrum" className="footer-logo" />
            <p className="footer-text">Built for Arbitrum ARG25</p>
          </div>
          <div className="footer-links">
            <a href="https://github.com/DevCristobalvc/zkp-jwt-mvp" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="https://sepolia.arbiscan.io/address/0xf935f364f797AF2336FfDb3ee06431e1616B7c6C" target="_blank" rel="noopener noreferrer">
              Solidity Contract
            </a>
            <a href="https://sepolia.arbiscan.io/address/0x531668485fe72c14bb3eed355916f27f4d0b7dea" target="_blank" rel="noopener noreferrer">
              Stylus Contract
            </a>
            <a href="https://docs.arbitrum.io/stylus" target="_blank" rel="noopener noreferrer">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
