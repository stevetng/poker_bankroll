import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

const API_BASE = 'https://us-central1-poker-bankroll-tracker-3bd0a.cloudfunctions.net/api';

export default function ApiSettings({ uid }) {
  const [apiKey, setApiKey] = useState('');
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, 'users', uid, 'config', 'api'),
      (snap) => {
        if (snap.exists()) {
          setApiKey(snap.data().apiKey || '');
          setWebhooks(snap.data().webhooks || []);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, [uid]);

  const generateKey = useCallback(async () => {
    const key = 'pk_' + crypto.randomUUID().replace(/-/g, '');
    await setDoc(doc(db, 'users', uid, 'config', 'api'), { apiKey: key, webhooks }, { merge: true });
    setApiKey(key);
  }, [uid, webhooks]);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addWebhook = async () => {
    const url = newWebhook.trim();
    if (!url || webhooks.includes(url)) return;
    try {
      new URL(url);
    } catch {
      return;
    }
    await updateDoc(doc(db, 'users', uid, 'config', 'api'), { webhooks: arrayUnion(url) });
    setNewWebhook('');
  };

  const removeWebhook = async (url) => {
    await updateDoc(doc(db, 'users', uid, 'config', 'api'), { webhooks: arrayRemove(url) });
  };

  const endpoints = [
    { method: 'GET', path: '/sessions', desc: 'List all sessions' },
    { method: 'GET', path: '/sessions/:id', desc: 'Get a specific session' },
    { method: 'POST', path: '/sessions', desc: 'Create a new session' },
    { method: 'PUT', path: '/sessions/:id', desc: 'Update a session' },
    { method: 'DELETE', path: '/sessions/:id', desc: 'Delete a session' },
    { method: 'GET', path: '/stats', desc: 'Get computed stats (profit, win rate, hourly, etc.)' },
    { method: 'GET', path: '/bankroll', desc: 'Get bankroll config' },
    { method: 'PUT', path: '/bankroll', desc: 'Update starting bankroll' },
  ];

  if (loading) return null;

  return (
    <div className="api-settings">
      <h2>API & Webhooks</h2>

      <div className="api-section">
        <h3>API Key</h3>
        <p>Use your API key to authenticate requests. Include it as a header: <code>x-api-key: YOUR_KEY</code></p>
        {apiKey ? (
          <>
            <div className="api-key-display">
              <div className="api-key-value">{apiKey}</div>
              <button className="btn btn-sm" onClick={copyKey}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={generateKey} style={{ marginTop: 8 }}>
              Regenerate Key
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={generateKey}>Generate API Key</button>
        )}
      </div>

      <div className="api-section">
        <h3>Webhooks</h3>
        <p>Get notified when sessions are created, updated, or deleted. We'll POST a JSON payload to your URL.</p>
        {webhooks.length > 0 && (
          <div className="webhook-list">
            {webhooks.map((url) => (
              <div key={url} className="webhook-item">
                <span className="webhook-url">{url}</span>
                <button className="btn-icon btn-danger" onClick={() => removeWebhook(url)}>x</button>
              </div>
            ))}
          </div>
        )}
        <div className="webhook-add">
          <input
            value={newWebhook}
            onChange={(e) => setNewWebhook(e.target.value)}
            placeholder="https://your-server.com/webhook"
            onKeyDown={(e) => e.key === 'Enter' && addWebhook()}
          />
          <button className="btn btn-sm" onClick={addWebhook}>Add</button>
        </div>
      </div>

      <div className="api-section">
        <h3>Endpoints</h3>
        <p>Base URL: <code>{API_BASE}</code></p>
        {endpoints.map((ep) => (
          <div key={ep.method + ep.path} className="api-endpoint">
            <span className={`api-endpoint-method ${ep.method.toLowerCase()}`}>{ep.method}</span>
            <span className="api-endpoint-path">{ep.path}</span>
            <p className="api-endpoint-desc">{ep.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
