export type DataCenter = {
  id: string;
  name: string;
  label?: string;
  x: number;
  y: number;
};

export type MplsLink = {
  id: string;
  fromId: string;
  toId: string;
  bandwidthMbps: number;
  monthlyPriceUsd: number;
  tierId?: string;
  notes?: string;
};

export type PriceTier = {
  id: string;
  name: string;
  bandwidthMbps: number;
  monthlyPriceUsd: number;
};

export type Design = {
  dataCenters: DataCenter[];
  links: MplsLink[];
  priceTiers: PriceTier[];
};

export type Selection =
  | { type: 'datacenter'; id: string }
  | { type: 'link'; id: string }
  | null;
