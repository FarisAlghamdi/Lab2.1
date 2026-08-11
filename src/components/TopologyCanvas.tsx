import { useCallback, useRef, useState } from 'react';
import { useDesignStore } from '../store/designStore';
import { formatBandwidth, formatCurrency } from '../utils/format';
import './TopologyCanvas.css';

const NODE_R = 28;

export function TopologyCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataCenters = useDesignStore((s) => s.dataCenters);
  const links = useDesignStore((s) => s.links);
  const selection = useDesignStore((s) => s.selection);
  const linkSourceId = useDesignStore((s) => s.linkSourceId);
  const addDataCenter = useDesignStore((s) => s.addDataCenter);
  const moveDataCenter = useDesignStore((s) => s.moveDataCenter);
  const setSelection = useDesignStore((s) => s.setSelection);
  const setLinkSourceId = useDesignStore((s) => s.setLinkSourceId);
  const addLink = useDesignStore((s) => s.addLink);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragMoved = useRef(false);

  const toSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const handleBackgroundClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current && (e.target as Element).tagName !== 'rect') {
      return;
    }
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    const { x, y } = toSvgPoint(e.clientX, e.clientY);
    if (linkSourceId) {
      setLinkSourceId(null);
      return;
    }
    setSelection(null);
    addDataCenter(x, y);
  };

  const handleNodePointerDown = (
    e: React.PointerEvent,
    id: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingId(id);
    dragMoved.current = false;
    setSelection({ type: 'datacenter', id });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    dragMoved.current = true;
    const { x, y } = toSvgPoint(e.clientX, e.clientY);
    const w = svgRef.current?.viewBox.baseVal.width ?? 1000;
    const h = svgRef.current?.viewBox.baseVal.height ?? 600;
    moveDataCenter(
      draggingId,
      Math.max(NODE_R, Math.min(w - NODE_R, x)),
      Math.max(NODE_R, Math.min(h - NODE_R, y)),
    );
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }

    if (e.shiftKey || linkSourceId) {
      if (!linkSourceId) {
        setLinkSourceId(id);
        setSelection({ type: 'datacenter', id });
        return;
      }
      if (linkSourceId === id) {
        setLinkSourceId(null);
        return;
      }
      addLink(linkSourceId, id);
      return;
    }

    setSelection({ type: 'datacenter', id });
  };

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLinkSourceId(null);
    setSelection({ type: 'link', id });
  };

  const dcById = Object.fromEntries(dataCenters.map((dc) => [dc.id, dc]));

  return (
    <div className="canvas-wrap">
      <div className="canvas-hint">
        Click empty space to add a DC · Drag to move · Shift-click two DCs (or
        click Connect then another DC) to create an MPLS link
        {linkSourceId ? (
          <span className="canvas-hint-active">
            {' '}
            — select a second DC to connect from{' '}
            <strong>
              {dcById[linkSourceId]?.name ?? 'selected DC'}
            </strong>
            …
          </span>
        ) : null}
      </div>
      <svg
        ref={svgRef}
        className="topology-canvas"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid meet"
        onClick={handleBackgroundClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="1"
            />
          </pattern>
          <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
          </filter>
        </defs>

        <rect width="1000" height="600" fill="url(#grid)" className="canvas-bg" />

        {links.map((link) => {
          const from = dcById[link.fromId];
          const to = dcById[link.toId];
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const selected =
            selection?.type === 'link' && selection.id === link.id;
          return (
            <g
              key={link.id}
              className={`link-group${selected ? ' selected' : ''}`}
              onClick={(e) => handleLinkClick(e, link.id)}
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="link-hit"
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className="link-line"
              />
              <rect
                x={mx - 54}
                y={my - 22}
                width={108}
                height={36}
                rx={8}
                className="link-label-bg"
              />
              <text x={mx} y={my - 4} className="link-label-bw">
                {formatBandwidth(link.bandwidthMbps)}
              </text>
              <text x={mx} y={my + 12} className="link-label-price">
                {formatCurrency(link.monthlyPriceUsd)}/mo
              </text>
            </g>
          );
        })}

        {dataCenters.map((dc) => {
          const selected =
            selection?.type === 'datacenter' && selection.id === dc.id;
          const isSource = linkSourceId === dc.id;
          return (
            <g
              key={dc.id}
              className={`dc-group${selected ? ' selected' : ''}${isSource ? ' link-source' : ''}`}
              transform={`translate(${dc.x}, ${dc.y})`}
              onPointerDown={(e) => handleNodePointerDown(e, dc.id)}
              onClick={(e) => handleNodeClick(e, dc.id)}
            >
              <circle r={NODE_R} className="dc-node" filter="url(#nodeShadow)" />
              <text className="dc-icon" textAnchor="middle" dy="5">
                DC
              </text>
              <text className="dc-name" textAnchor="middle" y={NODE_R + 16}>
                {dc.name}
              </text>
              {dc.label ? (
                <text className="dc-label" textAnchor="middle" y={NODE_R + 32}>
                  {dc.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
