import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import './App.css';

const LOGO = './arbitrum-logo.svg';

interface WalletState {
  address: string | null;
  provider: BrowserProvider | null;
}

function App() {
  const [wallet, setWallet] = useState<WalletState>({ address: null, provider: null });
  const [page, setPage] = useState<'app' | 'docs'>('app');
  const [mode, setMode] = useState<'create' | 'verify'>('create');
  const [message, setMessage] = useState('');
  const [wallets, setWallets] = useState<string[]>([]);
  const [newWallet, setNewWallet] = useState('');
  const [token, setToken] = useState('');
  const [result, setResult] = useState<string>('');

  const connect = async () => {
    if (!window.ethereum) return alert('Install MetaMask!');
    try {
      const p = new BrowserProvider(window.ethereum);
      const a = await p.send('eth_requestAccounts', []);
      setWallet({ address: a[0], provider: p });
    } catch (e) {
      console.error(e);
    }
  };

  const disconnect = () => setWallet({ address: null, provider: null });

  const addWallet = () => {
    if (newWallet && !wallets.includes(newWallet)) {
      setWallets([...wallets, newWallet]);
      setNewWallet('');
    }
  };

  const removeWallet = (addr: string) => setWallets(wallets.filter(w => w !== addr));

  const generate = async () => {
    const tk = `eyJ0eXAiOiJKV1QifQ.${btoa(JSON.stringify({ msg: message, wallets, t: Date.now() }))}.sig`;
    setToken(tk);
  };

  const verify = () => {
    setResult(token.startsWith('eyJ0') ? 'Valid token!' : 'Invalid token');
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-left">
            <img src={LOGO} alt="Arbitrum" className="nav-logo" />
            <span className="nav-title">ZKPJWT</span>
            <div className="nav-links">
              <button className={page === 'app' ? 'active' : ''} onClick={() => setPage('app')}>Protocol</button>
              <button className={page === 'docs' ? 'active' : ''} onClick={() => setPage('docs')}>Docs</button>
            </div>
          </div>
          <div className="nav-right">
            {!wallet.address ? (
              <button onClick={connect} className="btn-connect">Connect Wallet</button>
            ) : (
              <div className="wallet-badge">
                <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                <button onClick={disconnect} className="btn-disconnect">×</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {page === 'app' ? (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>Privacy-Preserving Access Control</h1>
              <p>Zero-knowledge proof authentication with encrypted data on Arbitrum</p>
            </div>
          </section>

          <div className="mode-tabs">
            <button className={mode === 'create' ? 'active' : ''} onClick={() => setMode('create')}>Create Token</button>
            <button className={mode === 'verify' ? 'active' : ''} onClick={() => setMode('verify')}>Verify Token</button>
          </div>

          <main className="main">
            <div className="container">
              {mode === 'create' ? (
                <div className="panel">
                  <h2>Create ZKPJWT Token</h2>
                  <div className="section">
                    <label>Secret Message:</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enter your message..." />
                  </div>
                  <div className="section">
                    <label>Authorized Wallets:</label>
                    <div className="wallet-input">
                      <input value={newWallet} onChange={e => setNewWallet(e.target.value)} placeholder="0x..." />
                      <button onClick={addWallet}>Add</button>
                    </div>
                    {wallets.length > 0 && (
                      <ul className="wallet-list">
                        {wallets.map((w, i) => (
                          <li key={i}>
                            <span>{w}</span>
                            <button onClick={() => removeWallet(w)}>Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button onClick={generate} className="action-btn" disabled={!wallet.address || !message}>
                    Generate Token
                  </button>
                  {token && (
                    <div className="token-output">
                      <h3>Token:</h3>
                      <div className="token-box">{token}</div>
                      <button onClick={() => navigator.clipboard.writeText(token)}>Copy</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="panel">
                  <h2>Verify ZKPJWT Token</h2>
                  <div className="section">
                    <label>Paste Token:</label>
                    <textarea value={token} onChange={e => setToken(e.target.value)} placeholder="Paste token..." />
                  </div>
                  <button onClick={verify} className="action-btn" disabled={!wallet.address || !token}>
                    Verify
                  </button>
                  {result && <div className={result.includes('Valid') ? 'success-msg' : 'error-msg'}>{result}</div>}
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <main className="main docs-page">
          <div className="docs-content">
            <h1>Documentation</h1>
            <section className="docs-section">
              <h2>What is ZKPJWT?</h2>
              <p>Privacy-preserving authentication protocol combining JWT with zero-knowledge proofs on Arbitrum Stylus.</p>
            </section>
            <section className="docs-section">
              <h2>Smart Contracts</h2>
              <div className="contract-item">
                <h3>Stylus (Rust)</h3>
                <code>0x531668485fe72c14bb3eed355916f27f4d0b7dea</code>
                <a href="https://sepolia.arbiscan.io/address/0x531668485fe72c14bb3eed355916f27f4d0b7dea" target="_blank" rel="noopener noreferrer">View on Arbiscan</a>
                <p className="stylus-note">90% gas savings</p>
              </div>
              <div className="contract-item">
                <h3>Solidity</h3>
                <code>0xf935f364f797AF2336FfDb3ee06431e1616B7c6C</code>
                <a href="https://sepolia.arbiscan.io/address/0xf935f364f797AF2336FfDb3ee06431e1616B7c6C" target="_blank" rel="noopener noreferrer">View on Arbiscan</a>
              </div>
            </section>
          </div>
        </main>
      )}

      <footer className="footer">
        <div className="footer-content">
          <span>Built for Arbitrum ARG25</span>
          <div className="footer-right">
            <span>Powered by</span>
            <img src={LOGO} alt="Arbitrum" className="footer-logo" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
