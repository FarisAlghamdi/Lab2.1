import type { Design } from '../types';
import { MOCK_PRICE_TIERS } from './mockPriceTiers';

/** Demo topology shown on first load when nothing is in localStorage. */
export const SEED_DESIGN: Design = {
  priceTiers: MOCK_PRICE_TIERS,
  dataCenters: [
    { id: 'dc-ash', name: 'Ashburn DC', label: 'US-East', x: 180, y: 220 },
    { id: 'dc-dal', name: 'Dallas DC', label: 'US-Central', x: 420, y: 320 },
    { id: 'dc-sjc', name: 'San Jose DC', label: 'US-West', x: 680, y: 200 },
    { id: 'dc-chi', name: 'Chicago DC', label: 'US-Central', x: 360, y: 140 },
  ],
  links: [
    {
      id: 'link-ash-dal',
      fromId: 'dc-ash',
      toId: 'dc-dal',
      bandwidthMbps: 10000,
      monthlyPriceUsd: 6500,
      tierId: 'tier-10g',
      notes: 'Primary east–central MPLS',
    },
    {
      id: 'link-dal-sjc',
      fromId: 'dc-dal',
      toId: 'dc-sjc',
      bandwidthMbps: 10000,
      monthlyPriceUsd: 6500,
      tierId: 'tier-10g',
      notes: 'Primary central–west MPLS',
    },
    {
      id: 'link-ash-chi',
      fromId: 'dc-ash',
      toId: 'dc-chi',
      bandwidthMbps: 1000,
      monthlyPriceUsd: 1800,
      tierId: 'tier-1g',
      notes: 'Backup path',
    },
  ],
};
