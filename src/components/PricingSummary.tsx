import { useMemo, useState } from 'react';
import { useDesignStore } from '../store/designStore';
import { formatBandwidth, formatCurrency } from '../utils/format';
import './PricingSummary.css';

type SortKey = 'path' | 'bandwidth' | 'price';

export function PricingSummary() {
  const dataCenters = useDesignStore((s) => s.dataCenters);
  const links = useDesignStore((s) => s.links);
  const setSelection = useDesignStore((s) => s.setSelection);
  const [sortKey, setSortKey] = useState<SortKey>('price');

  const dcById = useMemo(
    () => Object.fromEntries(dataCenters.map((dc) => [dc.id, dc])),
    [dataCenters],
  );

  const totals = useMemo(() => {
    const monthly = links.reduce((sum, l) => sum + l.monthlyPriceUsd, 0);
    const bandwidth = links.reduce((sum, l) => sum + l.bandwidthMbps, 0);
    return { monthly, bandwidth, count: links.length };
  }, [links]);

  const rows = useMemo(() => {
    const mapped = links.map((link) => ({
      link,
      path: `${dcById[link.fromId]?.name ?? '?'} ↔ ${dcById[link.toId]?.name ?? '?'}`,
    }));
    mapped.sort((a, b) => {
      if (sortKey === 'bandwidth') {
        return b.link.bandwidthMbps - a.link.bandwidthMbps;
      }
      if (sortKey === 'price') {
        return b.link.monthlyPriceUsd - a.link.monthlyPriceUsd;
      }
      return a.path.localeCompare(b.path);
    });
    return mapped;
  }, [links, dcById, sortKey]);

  return (
    <section className="panel-card pricing-summary">
      <h2>Pricing summary</h2>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Monthly total</span>
          <span className="stat-value accent">
            {formatCurrency(totals.monthly)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Total bandwidth</span>
          <span className="stat-value">
            {formatBandwidth(totals.bandwidth)}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">MPLS links</span>
          <span className="stat-value">{totals.count}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Data centers</span>
          <span className="stat-value">{dataCenters.length}</span>
        </div>
      </div>

      {links.length === 0 ? (
        <p className="muted empty">
          No MPLS links yet. Connect two data centers to see pricing.
        </p>
      ) : (
        <>
          <div className="sort-bar">
            <span>Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="price">Price</option>
              <option value="bandwidth">Bandwidth</option>
              <option value="path">Path</option>
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Path</th>
                  <th>BW</th>
                  <th>$/mo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ link, path }) => (
                  <tr
                    key={link.id}
                    onClick={() => setSelection({ type: 'link', id: link.id })}
                  >
                    <td>{path}</td>
                    <td>{formatBandwidth(link.bandwidthMbps)}</td>
                    <td>{formatCurrency(link.monthlyPriceUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
