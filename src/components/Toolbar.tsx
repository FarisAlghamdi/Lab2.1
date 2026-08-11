import { useRef } from 'react';
import { useDesignStore } from '../store/designStore';
import './Toolbar.css';

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const newDesign = useDesignStore((s) => s.newDesign);
  const exportDesign = useDesignStore((s) => s.exportDesign);
  const importDesign = useDesignStore((s) => s.importDesign);
  const setCatalogOpen = useDesignStore((s) => s.setCatalogOpen);

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      importDesign(text);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed.';
      window.alert(message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <div className="logo">MPLS</div>
        <div>
          <h1>DC-to-DC Network Design</h1>
          <p>High-level MPLS topology, bandwidth &amp; pricing</p>
        </div>
      </div>
      <div className="toolbar-actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (
              window.confirm(
                'Start a new empty design? Unsaved canvas changes in this browser will be replaced.',
              )
            ) {
              newDesign();
            }
          }}
        >
          New
        </button>
        <button type="button" className="btn" onClick={exportDesign}>
          Export JSON
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => handleImport(e.target.files?.[0])}
        />
        <button
          type="button"
          className="btn primary"
          onClick={() => setCatalogOpen(true)}
        >
          Price sheet
        </button>
      </div>
    </header>
  );
}
