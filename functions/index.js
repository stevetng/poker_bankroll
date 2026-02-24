const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// Middleware: authenticate via API key
async function authenticate(req, res) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    res.status(401).json({ error: 'Missing x-api-key header' });
    return null;
  }

  const snapshot = await db.collectionGroup('config')
    .where('apiKey', '==', apiKey)
    .limit(1)
    .get();

  if (snapshot.empty) {
    res.status(401).json({ error: 'Invalid API key' });
    return null;
  }

  // Path: users/{uid}/config/api
  const docPath = snapshot.docs[0].ref.path;
  const uid = docPath.split('/')[1];
  return uid;
}

// Fire webhooks
async function fireWebhooks(uid, event, data) {
  try {
    const configSnap = await db.doc(`users/${uid}/config/api`).get();
    if (!configSnap.exists) return;
    const webhooks = configSnap.data().webhooks || [];
    const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

    await Promise.allSettled(
      webhooks.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        })
      )
    );
  } catch (err) {
    console.error('Webhook error:', err);
  }
}

exports.api = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const path = req.path.replace(/^\/+|\/+$/g, '');
      const segments = path.split('/');
      const resource = segments[0];
      const resourceId = segments[1];

      const uid = await authenticate(req, res);
      if (!uid) return;

      // --- SESSIONS ---
      if (resource === 'sessions') {
        const sessionsRef = db.collection(`users/${uid}/sessions`);

        // GET /sessions
        if (req.method === 'GET' && !resourceId) {
          const snap = await sessionsRef.get();
          const sessions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          return res.json({ sessions });
        }

        // GET /sessions/:id
        if (req.method === 'GET' && resourceId) {
          const doc = await sessionsRef.doc(resourceId).get();
          if (!doc.exists) return res.status(404).json({ error: 'Session not found' });
          return res.json({ id: doc.id, ...doc.data() });
        }

        // POST /sessions
        if (req.method === 'POST') {
          const { date, gameType, stakes, location, duration, buyIn, cashOut, notes } = req.body;
          if (!date || buyIn === undefined || cashOut === undefined) {
            return res.status(400).json({ error: 'date, buyIn, and cashOut are required' });
          }
          const session = {
            date,
            gameType: gameType || 'No Limit Hold\'em',
            stakes: stakes || '1/2',
            location: location || '',
            duration: Number(duration) || 0,
            buyIn: Number(buyIn),
            cashOut: Number(cashOut),
            notes: notes || '',
          };
          const docRef = await sessionsRef.add(session);
          await fireWebhooks(uid, 'session.created', { id: docRef.id, ...session });
          return res.status(201).json({ id: docRef.id, ...session });
        }

        // PUT /sessions/:id
        if (req.method === 'PUT' && resourceId) {
          const doc = await sessionsRef.doc(resourceId).get();
          if (!doc.exists) return res.status(404).json({ error: 'Session not found' });
          const updates = {};
          ['date', 'gameType', 'stakes', 'location', 'notes'].forEach((k) => {
            if (req.body[k] !== undefined) updates[k] = req.body[k];
          });
          ['duration', 'buyIn', 'cashOut'].forEach((k) => {
            if (req.body[k] !== undefined) updates[k] = Number(req.body[k]);
          });
          await sessionsRef.doc(resourceId).update(updates);
          const updated = await sessionsRef.doc(resourceId).get();
          await fireWebhooks(uid, 'session.updated', { id: resourceId, ...updated.data() });
          return res.json({ id: resourceId, ...updated.data() });
        }

        // DELETE /sessions/:id
        if (req.method === 'DELETE' && resourceId) {
          const doc = await sessionsRef.doc(resourceId).get();
          if (!doc.exists) return res.status(404).json({ error: 'Session not found' });
          await sessionsRef.doc(resourceId).delete();
          await fireWebhooks(uid, 'session.deleted', { id: resourceId });
          return res.json({ deleted: true, id: resourceId });
        }
      }

      // --- STATS ---
      if (resource === 'stats' && req.method === 'GET') {
        const snap = await db.collection(`users/${uid}/sessions`).get();
        const sessions = snap.docs.map((d) => d.data());

        if (sessions.length === 0) {
          return res.json({ totalSessions: 0, totalProfit: 0, winRate: 0, hourlyRate: 0 });
        }

        const totalProfit = sessions.reduce((s, x) => s + (x.cashOut - x.buyIn), 0);
        const totalHours = sessions.reduce((s, x) => s + x.duration, 0) / 60;
        const wins = sessions.filter((x) => x.cashOut - x.buyIn > 0).length;
        const profits = sessions.map((x) => x.cashOut - x.buyIn);

        return res.json({
          totalSessions: sessions.length,
          totalProfit,
          winRate: (wins / sessions.length) * 100,
          hourlyRate: totalHours > 0 ? totalProfit / totalHours : 0,
          avgProfit: totalProfit / sessions.length,
          totalHours,
          biggestWin: Math.max(...profits),
          biggestLoss: Math.min(...profits),
        });
      }

      // --- BANKROLL ---
      if (resource === 'bankroll') {
        if (req.method === 'GET') {
          const snap = await db.doc(`users/${uid}/config/bankroll`).get();
          const startingBankroll = snap.exists ? snap.data().startingBankroll || 0 : 0;
          const sessSnap = await db.collection(`users/${uid}/sessions`).get();
          const totalProfit = sessSnap.docs.reduce((s, d) => s + (d.data().cashOut - d.data().buyIn), 0);
          return res.json({ startingBankroll, currentBankroll: startingBankroll + totalProfit, totalProfit });
        }

        if (req.method === 'PUT') {
          const { startingBankroll } = req.body;
          if (startingBankroll === undefined) {
            return res.status(400).json({ error: 'startingBankroll is required' });
          }
          await db.doc(`users/${uid}/config/bankroll`).set({ startingBankroll: Number(startingBankroll) });
          return res.json({ startingBankroll: Number(startingBankroll) });
        }
      }

      res.status(404).json({ error: 'Not found' });
    } catch (err) {
      console.error('API error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});
