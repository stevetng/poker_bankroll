import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';

export default function ImportExport({ sessions, onImport }) {
  const [status, setStatus] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const exportJSON = () => {
    const data = JSON.stringify(sessions.map(({ id, ...rest }) => rest), null, 2);
    download(data, 'poker-sessions.json', 'application/json');
  };

  const exportCSV = () => {
    const headers = ['Date', 'Game Type', 'Stakes', 'Location', 'Duration (min)', 'Buy-In', 'Cash-Out', 'Profit', 'Notes'];
    const rows = sessions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((s) => [
        s.date,
        s.gameType,
        s.stakes,
        s.location,
        s.duration,
        s.buyIn,
        s.cashOut,
        s.cashOut - s.buyIn,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(','));
    download([headers.join(','), ...rows].join('\n'), 'poker-sessions.csv', 'text/csv');
  };

  const download = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', message: `Exported ${sessions.length} sessions to ${filename}` });
  };

  const handleFile = async (file) => {
    if (!file) return;
    setStatus(null);
    try {
      const text = await file.text();
      let imported;

      if (file.name.endsWith('.csv')) {
        imported = parseCSV(text);
      } else {
        imported = JSON.parse(text);
      }

      if (!Array.isArray(imported) || imported.length === 0) {
        setStatus({ type: 'error', message: 'File contains no valid session data.' });
        return;
      }

      const valid = imported.filter((s) => s.date && s.buyIn !== undefined && s.cashOut !== undefined);
      if (valid.length === 0) {
        setStatus({ type: 'error', message: 'No valid sessions found. Ensure each has date, buyIn, and cashOut.' });
        return;
      }

      await onImport(valid);
      setStatus({ type: 'success', message: `Imported ${valid.length} sessions successfully.` });
    } catch (err) {
      setStatus({ type: 'error', message: `Import failed: ${err.message}` });
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    return lines.slice(1).map((line) => {
      const cols = line.match(/(".*?"|[^,]+)/g) || [];
      return {
        date: cols[0]?.trim() || '',
        gameType: cols[1]?.trim() || 'No Limit Hold\'em',
        stakes: cols[2]?.trim() || '1/2',
        location: cols[3]?.trim() || '',
        duration: Number(cols[4]?.trim()) || 0,
        buyIn: Number(cols[5]?.trim()) || 0,
        cashOut: Number(cols[6]?.trim()) || 0,
        notes: (cols[8] || '').replace(/^"|"$/g, '').replace(/""/g, '"').trim(),
      };
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="import-export">
      <h2>Import / Export</h2>

      <div className="ie-section">
        <h3>Export Sessions</h3>
        <p>Download all {sessions.length} session{sessions.length !== 1 ? 's' : ''} as JSON or CSV.</p>
        <div className="ie-buttons">
          <button className="btn btn-primary" onClick={exportJSON} disabled={!sessions.length}>
            Export JSON
          </button>
          <button className="btn btn-secondary" onClick={exportCSV} disabled={!sessions.length}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="ie-section">
        <h3>Import Sessions</h3>
        <p>Import from a JSON or CSV file. Sessions will be added to your existing data.</p>
        <div
          className={`ie-drop-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          Drop a .json or .csv file here, or click to browse
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {status && (
        <div className={`ie-status ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
