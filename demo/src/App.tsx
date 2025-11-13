import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import './App.css';
import SenderPanel from './components/SenderPanel';
import ReceiverPanel from './components/ReceiverPanel';
import arbitrumLogo from '/arbitrum-logo.svg';

interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
}

type Page = 'app' | 'docs';
type Mode = 'sender' | 'receiver';

function App() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, provider: null });
  const [page, setPage] = useState<Page>('app');
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

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-left">
            <img src={arbitrumLogo} alt="Arbitrum" className="nav-logo" />
            <span className="nav-title">ZKPJWT</span>
            <div className="nav-links">
              <button 
                className={page === 'app' ? 'nav-link active' : 'nav-link'}
                onClick={() => setPage('app')}
              >
                Protocol
              </button>
              <button 
                className={page === 'docs' ? 'nav-link active' : 'nav-link'}
                onClick={() => setPage('docs')}
              >
                Docs
              </button>
            </div>
          </div>
          <div className="nav-right">
            {!wallet.address ? (
              <button onClick={connectWallet} className="btn-connect">
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-badge">
                <span className="wallet-address">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                <button onClick={disconnectWallet} className="btn-disconnect">
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {page === 'app' ? (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">Privacy-Preserving Access Control</h1>
              <p className="hero-subtitle">
                Zero-knowledge proof authentication with encrypted data on Arbitrum
              </p>
            </div>
          </section>

          {/* Mode Tabs */}
          <div className="mode-tabs">
            <button
              className={mode === 'sender' ? 'mode-tab active' : 'mode-tab'}
              onClick={() => setMode('sender')}
            >
              Create Token
            </button>
            <button
              className={mode === 'receiver' ? 'mode-tab active' : 'mode-tab'}
              onClick={() => setMode('receiver')}
            >
              Verify Token
            </button>
          </div>

          {/* Panel */}
          <main className="main">
            <div className="container">
              {mode === 'sender' ? (
                <SenderPanel wallet={wallet} />
              ) : (
                <ReceiverPanel wallet={wallet} />
              )}
            </div>
          </main>
        </>
      ) : (
        <main className="main docs-page">
          <div className="container">
            <div className="docs-content">
              <h1>Documentation</h1>
              
              <section className="docs-section">
                <h2>What is ZKPJWT?</h2>
                <p>
                  ZKPJWT is a decentralized protocol for privacy-preserving access control using 
                  Zero-Knowledge Proofs and Merkle trees on Arbitrum.
                </p>
              </section>

              <section className="docs-section">
                <h2>How It Works</h2>
                <ol>
                  <li><strong>Create</strong> - Sender encrypts a message with AES-256-GCM</li>
                  <li><strong>Authorize</strong> - Build Merkle tree from authorized wallets</li>
                  <li><strong>Publish</strong> - Store Merkle root on-chain (32 bytes only)</li>
                  <li><strong>Verify</strong> - Receiver proves membership with ZK proof</li>
                  <li><strong>Decrypt</strong> - Access granted if proof is valid</li>
                </ol>
              </section>

              <section className="docs-section">
                <h2>Smart Contracts</h2>
                <div className="contract-list">
                  <div className="contract-item">
                    <h3>Solidity Implementation</h3>
                    <code>0xf935f364f797AF2336FfDb3ee06431e1616B7c6C</code>
                    <a 
                      href="https://sepolia.arbiscan.io/address/0xf935f364f797AF2336FfDb3ee06431e1616B7c6C" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contract-link"
                    >
                      View on Arbiscan →
                    </a>
                  </div>
                  <div className="contract-item">
                    <h3>Stylus (Rust) Implementation</h3>
                    <code>0x531668485fe72c14bb3eed355916f27f4d0b7dea</code>
                    <a 
                      href="https://sepolia.arbiscan.io/address/0x531668485fe72c14bb3eed355916f27f4d0b7dea" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contract-link"
                    >
                      View on Arbiscan →
                    </a>
                    <p className="stylus-note">90% gas savings vs Solidity</p>
                  </div>
                </div>
              </section>

              <section className="docs-section">
                <h2>Resources</h2>
                <ul className="resource-list">
                  <li>
                    <a href="https://github.com/DevCristobalvc/zkp-jwt-mvp" target="_blank" rel="noopener noreferrer">
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.arbitrum.io/stylus" target="_blank" rel="noopener noreferrer">
                      Arbitrum Stylus Docs
                    </a>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-text">Built for Arbitrum ARG25</span>
          </div>
          <div className="footer-right">
            <span className="footer-powered">Powered by</span>
            <img src={arbitrumLogo} alt="Arbitrum" className="footer-logo" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
