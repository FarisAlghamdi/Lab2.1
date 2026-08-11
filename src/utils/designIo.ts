import type { Design, DataCenter, MplsLink, PriceTier } from '../types';
import { MOCK_PRICE_TIERS } from '../data/mockPriceTiers';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDataCenter(value: unknown): value is DataCenter {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    (value.label === undefined || typeof value.label === 'string')
  );
}

function isMplsLink(value: unknown): value is MplsLink {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.fromId === 'string' &&
    typeof value.toId === 'string' &&
    typeof value.bandwidthMbps === 'number' &&
    typeof value.monthlyPriceUsd === 'number' &&
    (value.tierId === undefined || typeof value.tierId === 'string') &&
    (value.notes === undefined || typeof value.notes === 'string')
  );
}

function isPriceTier(value: unknown): value is PriceTier {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.bandwidthMbps === 'number' &&
    typeof value.monthlyPriceUsd === 'number'
  );
}

export function parseDesignJson(raw: string): Design {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Design must be a JSON object.');
  }

  if (!Array.isArray(parsed.dataCenters) || !parsed.dataCenters.every(isDataCenter)) {
    throw new Error('Invalid or missing dataCenters array.');
  }

  if (!Array.isArray(parsed.links) || !parsed.links.every(isMplsLink)) {
    throw new Error('Invalid or missing links array.');
  }

  const priceTiers =
    Array.isArray(parsed.priceTiers) && parsed.priceTiers.every(isPriceTier)
      ? (parsed.priceTiers as PriceTier[])
      : MOCK_PRICE_TIERS;

  const dcIds = new Set(parsed.dataCenters.map((dc) => dc.id));
  for (const link of parsed.links) {
    if (!dcIds.has(link.fromId) || !dcIds.has(link.toId)) {
      throw new Error(`Link ${link.id} references unknown data centers.`);
    }
  }

  return {
    dataCenters: parsed.dataCenters,
    links: parsed.links,
    priceTiers,
  };
}

export function downloadDesignJson(design: Design, filename = 'mpls-design.json') {
  const blob = new Blob([JSON.stringify(design, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
