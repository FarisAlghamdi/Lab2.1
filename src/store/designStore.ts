import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataCenter, Design, MplsLink, PriceTier, Selection } from '../types';
import { SEED_DESIGN } from '../data/seedDesign';
import { createId } from '../utils/format';
import { downloadDesignJson, parseDesignJson } from '../utils/designIo';

type DesignState = Design & {
  selection: Selection;
  linkSourceId: string | null;
  catalogOpen: boolean;

  setSelection: (selection: Selection) => void;
  setLinkSourceId: (id: string | null) => void;
  setCatalogOpen: (open: boolean) => void;

  addDataCenter: (x: number, y: number) => void;
  updateDataCenter: (id: string, patch: Partial<Omit<DataCenter, 'id'>>) => void;
  moveDataCenter: (id: string, x: number, y: number) => void;
  deleteDataCenter: (id: string) => void;

  addLink: (fromId: string, toId: string, tierId?: string) => void;
  updateLink: (id: string, patch: Partial<Omit<MplsLink, 'id'>>) => void;
  deleteLink: (id: string) => void;

  addPriceTier: () => void;
  updatePriceTier: (id: string, patch: Partial<Omit<PriceTier, 'id'>>) => void;
  deletePriceTier: (id: string) => void;

  applyTierToLink: (linkId: string, tierId: string) => void;
  newDesign: () => void;
  exportDesign: () => void;
  importDesign: (raw: string) => void;
};

function emptyDesign(): Design {
  return {
    dataCenters: [],
    links: [],
    priceTiers: SEED_DESIGN.priceTiers.map((t) => ({ ...t })),
  };
}

function defaultTier(tiers: PriceTier[]): PriceTier | undefined {
  return tiers.find((t) => t.id === 'tier-1g') ?? tiers[0];
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      ...SEED_DESIGN,
      selection: null,
      linkSourceId: null,
      catalogOpen: false,

      setSelection: (selection) => set({ selection }),
      setLinkSourceId: (id) => set({ linkSourceId: id }),
      setCatalogOpen: (open) => set({ catalogOpen: open }),

      addDataCenter: (x, y) => {
        const count = get().dataCenters.length + 1;
        const dc: DataCenter = {
          id: createId('dc'),
          name: `Data Center ${count}`,
          label: '',
          x,
          y,
        };
        set((s) => ({
          dataCenters: [...s.dataCenters, dc],
          selection: { type: 'datacenter', id: dc.id },
          linkSourceId: null,
        }));
      },

      updateDataCenter: (id, patch) => {
        set((s) => ({
          dataCenters: s.dataCenters.map((dc) =>
            dc.id === id ? { ...dc, ...patch } : dc,
          ),
        }));
      },

      moveDataCenter: (id, x, y) => {
        set((s) => ({
          dataCenters: s.dataCenters.map((dc) =>
            dc.id === id ? { ...dc, x, y } : dc,
          ),
        }));
      },

      deleteDataCenter: (id) => {
        set((s) => ({
          dataCenters: s.dataCenters.filter((dc) => dc.id !== id),
          links: s.links.filter((l) => l.fromId !== id && l.toId !== id),
          selection:
            s.selection?.type === 'datacenter' && s.selection.id === id
              ? null
              : s.selection?.type === 'link' &&
                  s.links.some(
                    (l) =>
                      l.id === s.selection!.id &&
                      (l.fromId === id || l.toId === id),
                  )
                ? null
                : s.selection,
          linkSourceId: s.linkSourceId === id ? null : s.linkSourceId,
        }));
      },

      addLink: (fromId, toId, tierId) => {
        if (fromId === toId) return;
        const exists = get().links.some(
          (l) =>
            (l.fromId === fromId && l.toId === toId) ||
            (l.fromId === toId && l.toId === fromId),
        );
        if (exists) {
          set({ linkSourceId: null });
          return;
        }

        const tiers = get().priceTiers;
        const tier =
          (tierId ? tiers.find((t) => t.id === tierId) : undefined) ??
          defaultTier(tiers);

        const link: MplsLink = {
          id: createId('link'),
          fromId,
          toId,
          bandwidthMbps: tier?.bandwidthMbps ?? 1000,
          monthlyPriceUsd: tier?.monthlyPriceUsd ?? 0,
          tierId: tier?.id,
          notes: '',
        };

        set((s) => ({
          links: [...s.links, link],
          selection: { type: 'link', id: link.id },
          linkSourceId: null,
        }));
      },

      updateLink: (id, patch) => {
        set((s) => ({
          links: s.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        }));
      },

      deleteLink: (id) => {
        set((s) => ({
          links: s.links.filter((l) => l.id !== id),
          selection:
            s.selection?.type === 'link' && s.selection.id === id
              ? null
              : s.selection,
        }));
      },

      addPriceTier: () => {
        const tier: PriceTier = {
          id: createId('tier'),
          name: 'Custom tier',
          bandwidthMbps: 500,
          monthlyPriceUsd: 900,
        };
        set((s) => ({ priceTiers: [...s.priceTiers, tier] }));
      },

      updatePriceTier: (id, patch) => {
        set((s) => ({
          priceTiers: s.priceTiers.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
          links: s.links.map((l) => {
            if (l.tierId !== id) return l;
            const next = { ...l };
            if (patch.bandwidthMbps !== undefined) {
              next.bandwidthMbps = patch.bandwidthMbps;
            }
            if (patch.monthlyPriceUsd !== undefined) {
              next.monthlyPriceUsd = patch.monthlyPriceUsd;
            }
            return next;
          }),
        }));
      },

      deletePriceTier: (id) => {
        set((s) => ({
          priceTiers: s.priceTiers.filter((t) => t.id !== id),
          links: s.links.map((l) =>
            l.tierId === id ? { ...l, tierId: undefined } : l,
          ),
        }));
      },

      applyTierToLink: (linkId, tierId) => {
        const tier = get().priceTiers.find((t) => t.id === tierId);
        if (!tier) {
          get().updateLink(linkId, { tierId: undefined });
          return;
        }
        get().updateLink(linkId, {
          tierId: tier.id,
          bandwidthMbps: tier.bandwidthMbps,
          monthlyPriceUsd: tier.monthlyPriceUsd,
        });
      },

      newDesign: () => {
        set({
          ...emptyDesign(),
          selection: null,
          linkSourceId: null,
        });
      },

      exportDesign: () => {
        const { dataCenters, links, priceTiers } = get();
        downloadDesignJson({ dataCenters, links, priceTiers });
      },

      importDesign: (raw) => {
        const design = parseDesignJson(raw);
        set({
          ...design,
          selection: null,
          linkSourceId: null,
        });
      },
    }),
    {
      name: 'mpls-network-design',
      partialize: (s) => ({
        dataCenters: s.dataCenters,
        links: s.links,
        priceTiers: s.priceTiers,
      }),
    },
  ),
);
