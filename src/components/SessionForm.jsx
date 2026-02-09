import { useState, useEffect } from 'react';

const GAME_TYPES = ['No Limit Hold\'em', 'Pot Limit Omaha', 'Limit Hold\'em', 'Mixed Games', 'Tournament'];
const DEFAULT_STAKES = ['1/2', '1/3', '2/5', '5/10', '10/20', '25/50'];

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  gameType: GAME_TYPES[0],
  stakes: DEFAULT_STAKES[0],
  location: '',
  duration: '',
  buyIn: '',
  cashOut: '',
  notes: '',
};

export default function SessionForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [customStakes, setCustomStakes] = useState(
    initial && !DEFAULT_STAKES.includes(initial.stakes) ? initial.stakes : ''
  );
  const [useCustomStakes, setUseCustomStakes] = useState(
    initial && !DEFAULT_STAKES.includes(initial.stakes)
  );

  useEffect(() => {
    if (initial) {
      setForm(initial);
      if (!DEFAULT_STAKES.includes(initial.stakes)) {
        setUseCustomStakes(true);
        setCustomStakes(initial.stakes);
      }
    }
  }, [initial]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stakes = useCustomStakes ? customStakes : form.stakes;
    onSubmit({ ...form, stakes });
    if (!initial) {
      setForm(emptyForm);
      setCustomStakes('');
      setUseCustomStakes(false);
    }
  };

  const profit = form.buyIn && form.cashOut ? Number(form.cashOut) - Number(form.buyIn) : null;

  return (
    <form className="session-form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit Session' : 'Log New Session'}</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Game Type</label>
          <select name="gameType" value={form.gameType} onChange={handleChange}>
            {GAME_TYPES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Stakes</label>
          {useCustomStakes ? (
            <div className="stakes-custom">
              <input
                type="text"
                value={customStakes}
                onChange={(e) => setCustomStakes(e.target.value)}
                placeholder="e.g. 3/5"
                required
              />
              <button type="button" className="btn-link" onClick={() => setUseCustomStakes(false)}>
                preset
              </button>
            </div>
          ) : (
            <div className="stakes-custom">
              <select name="stakes" value={form.stakes} onChange={handleChange}>
                {DEFAULT_STAKES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="btn-link" onClick={() => setUseCustomStakes(true)}>
                custom
              </button>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Casino / Home / Online"
            required
          />
        </div>
        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            placeholder="180"
            required
          />
        </div>
        <div className="form-group">
          <label>Buy-In ($)</label>
          <input
            type="number"
            name="buyIn"
            value={form.buyIn}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="500"
            required
          />
        </div>
        <div className="form-group">
          <label>Cash-Out ($)</label>
          <input
            type="number"
            name="cashOut"
            value={form.cashOut}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="750"
            required
          />
        </div>
        <div className="form-group">
          <label>
            Result Preview{' '}
            {profit !== null && (
              <span className={profit >= 0 ? 'text-green' : 'text-red'}>
                {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
              </span>
            )}
          </label>
        </div>
        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="2"
            placeholder="Optional session notes..."
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save Changes' : 'Log Session'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
