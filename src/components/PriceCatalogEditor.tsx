import { useDesignStore } from '../store/designStore';
import { formatBandwidth, formatCurrency } from '../utils/format';
import './PriceCatalogEditor.css';

export function PriceCatalogEditor() {
  const open = useDesignStore((s) => s.catalogOpen);
  const setCatalogOpen = useDesignStore((s) => s.setCatalogOpen);
  const priceTiers = useDesignStore((s) => s.priceTiers);
  const addPriceTier = useDesignStore((s) => s.addPriceTier);
  const updatePriceTier = useDesignStore((s) => s.updatePriceTier);
  const deletePriceTier = useDesignStore((s) => s.deletePriceTier);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => setCatalogOpen(false)}>
      <div
        className="modal catalog-modal"
        role="dialog"
        aria-labelledby="catalog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2 id="catalog-title">Mock price sheet</h2>
            <p className="modal-sub">
              Editable demo pricing. Replace later with a real carrier price
              sheet — links using a tier update when that tier changes.
            </p>
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => setCatalogOpen(false)}
          >
            Close
          </button>
        </header>

        <div className="catalog-table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>Tier name</th>
                <th>Bandwidth (Mbps)</th>
                <th>Monthly USD</th>
                <th>Preview</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {priceTiers.map((tier) => (
                <tr key={tier.id}>
                  <td>
                    <input
                      value={tier.name}
                      onChange={(e) =>
                        updatePriceTier(tier.id, { name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={tier.bandwidthMbps}
                      onChange={(e) =>
                        updatePriceTier(tier.id, {
                          bandwidthMbps: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={tier.monthlyPriceUsd}
                      onChange={(e) =>
                        updatePriceTier(tier.id, {
                          monthlyPriceUsd: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="preview">
                    {formatBandwidth(tier.bandwidthMbps)} ·{' '}
                    {formatCurrency(tier.monthlyPriceUsd)}/mo
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => deletePriceTier(tier.id)}
                      disabled={priceTiers.length <= 1}
                      title={
                        priceTiers.length <= 1
                          ? 'Keep at least one tier'
                          : 'Delete tier'
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn primary" onClick={addPriceTier}>
            Add tier
          </button>
        </footer>
      </div>
    </div>
  );
}
