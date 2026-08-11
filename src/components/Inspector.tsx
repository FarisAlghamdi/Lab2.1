import { useDesignStore } from '../store/designStore';
import { formatBandwidth } from '../utils/format';
import './Inspector.css';

export function Inspector() {
  const selection = useDesignStore((s) => s.selection);
  const dataCenters = useDesignStore((s) => s.dataCenters);
  const links = useDesignStore((s) => s.links);
  const priceTiers = useDesignStore((s) => s.priceTiers);
  const updateDataCenter = useDesignStore((s) => s.updateDataCenter);
  const deleteDataCenter = useDesignStore((s) => s.deleteDataCenter);
  const updateLink = useDesignStore((s) => s.updateLink);
  const deleteLink = useDesignStore((s) => s.deleteLink);
  const applyTierToLink = useDesignStore((s) => s.applyTierToLink);
  const setLinkSourceId = useDesignStore((s) => s.setLinkSourceId);
  const linkSourceId = useDesignStore((s) => s.linkSourceId);

  if (!selection) {
    return (
      <section className="panel-card inspector">
        <h2>Inspector</h2>
        <p className="muted">
          Select a data center or MPLS link on the canvas to edit it.
        </p>
        <ul className="tips">
          <li>Click empty canvas to add a data center</li>
          <li>Drag nodes to reposition</li>
          <li>Shift-click two DCs to create a link</li>
          <li>Press Delete to remove the selection</li>
        </ul>
      </section>
    );
  }

  if (selection.type === 'datacenter') {
    const dc = dataCenters.find((d) => d.id === selection.id);
    if (!dc) {
      return (
        <section className="panel-card inspector">
          <h2>Inspector</h2>
          <p className="muted">Data center not found.</p>
        </section>
      );
    }

    return (
      <section className="panel-card inspector">
        <h2>Data Center</h2>
        <label className="field">
          <span>Name</span>
          <input
            value={dc.name}
            onChange={(e) => updateDataCenter(dc.id, { name: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Region / city label</span>
          <input
            value={dc.label ?? ''}
            placeholder="e.g. US-East"
            onChange={(e) => updateDataCenter(dc.id, { label: e.target.value })}
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>X</span>
            <input
              type="number"
              value={Math.round(dc.x)}
              onChange={(e) =>
                updateDataCenter(dc.id, { x: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="field">
            <span>Y</span>
            <input
              type="number"
              value={Math.round(dc.y)}
              onChange={(e) =>
                updateDataCenter(dc.id, { y: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
        <div className="inspector-actions">
          <button
            type="button"
            className={linkSourceId === dc.id ? 'btn primary' : 'btn'}
            onClick={() =>
              setLinkSourceId(linkSourceId === dc.id ? null : dc.id)
            }
          >
            {linkSourceId === dc.id ? 'Cancel connect' : 'Connect MPLS…'}
          </button>
          <button
            type="button"
            className="btn danger"
            onClick={() => deleteDataCenter(dc.id)}
          >
            Delete DC
          </button>
        </div>
      </section>
    );
  }

  const link = links.find((l) => l.id === selection.id);
  if (!link) {
    return (
      <section className="panel-card inspector">
        <h2>Inspector</h2>
        <p className="muted">Link not found.</p>
      </section>
    );
  }

  const from = dataCenters.find((d) => d.id === link.fromId);
  const to = dataCenters.find((d) => d.id === link.toId);

  return (
    <section className="panel-card inspector">
      <h2>MPLS Link</h2>
      <p className="link-endpoints">
        {from?.name ?? 'Unknown'} ↔ {to?.name ?? 'Unknown'}
      </p>

      <label className="field">
        <span>Price tier</span>
        <select
          value={link.tierId ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              updateLink(link.id, { tierId: undefined });
              return;
            }
            applyTierToLink(link.id, value);
          }}
        >
          <option value="">Custom…</option>
          {priceTiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name} — {formatBandwidth(tier.bandwidthMbps)}
            </option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span>Bandwidth (Mbps)</span>
          <input
            type="number"
            min={1}
            value={link.bandwidthMbps}
            onChange={(e) =>
              updateLink(link.id, {
                bandwidthMbps: Number(e.target.value) || 0,
                tierId: undefined,
              })
            }
          />
        </label>
        <label className="field">
          <span>Monthly price (USD)</span>
          <input
            type="number"
            min={0}
            value={link.monthlyPriceUsd}
            onChange={(e) =>
              updateLink(link.id, {
                monthlyPriceUsd: Number(e.target.value) || 0,
                tierId: undefined,
              })
            }
          />
        </label>
      </div>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={link.notes ?? ''}
          placeholder="Optional carrier / circuit notes"
          onChange={(e) => updateLink(link.id, { notes: e.target.value })}
        />
      </label>

      <div className="inspector-actions">
        <button
          type="button"
          className="btn danger"
          onClick={() => deleteLink(link.id)}
        >
          Delete link
        </button>
      </div>
    </section>
  );
}
