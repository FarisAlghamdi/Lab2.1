import type { PriceTier } from '../types';

/** Editable mock price sheet — replace later with a real carrier price sheet. */
export const MOCK_PRICE_TIERS: PriceTier[] = [
  {
    id: 'tier-100m',
    name: '100 Mbps',
    bandwidthMbps: 100,
    monthlyPriceUsd: 450,
  },
  {
    id: 'tier-1g',
    name: '1 Gbps',
    bandwidthMbps: 1000,
    monthlyPriceUsd: 1800,
  },
  {
    id: 'tier-10g',
    name: '10 Gbps',
    bandwidthMbps: 10000,
    monthlyPriceUsd: 6500,
  },
  {
    id: 'tier-100g',
    name: '100 Gbps',
    bandwidthMbps: 100000,
    monthlyPriceUsd: 22000,
  },
];
