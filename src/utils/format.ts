export function formatBandwidth(mbps: number): string {
  if (mbps >= 1000 && mbps % 1000 === 0) {
    return `${mbps / 1000} Gbps`;
  }
  if (mbps >= 1000) {
    const gbps = mbps / 1000;
    return `${gbps % 1 === 0 ? gbps : gbps.toFixed(1)} Gbps`;
  }
  return `${mbps} Mbps`;
}

export function formatCurrency(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
