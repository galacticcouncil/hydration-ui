import { create } from "zustand"
import { persist } from "zustand/middleware"

type BannerType = "top" | "flow"

type BannersState = {
  banners: {
    ["new-farms"]: { visible?: boolean; type: BannerType; timestamp?: number }
    ["giga-stake"]: { visible?: boolean; type: BannerType; timestamp?: number }
  }
}

type BannersActions = {
  setBannerVisible: (
    id: keyof BannersState["banners"],
    visible: boolean,
    timestamp?: number,
  ) => void
}

type BannersStore = BannersState & BannersActions

const defaultState: BannersState = {
  banners: {
    ["new-farms"]: { visible: undefined, type: "top" },
    ["giga-stake"]: { visible: undefined, type: "flow" },
  },
}

const bannerIds = Object.keys(
  defaultState.banners,
) as (keyof BannersState["banners"])[]

function mergePersistedWithDefaults(
  persistedState: unknown,
  currentState: BannersStore,
): BannersStore {
  const p = persistedState as Partial<BannersState> | undefined
  const banners = Object.fromEntries(
    bannerIds.map((id) => [
      id,
      {
        ...defaultState.banners[id],
        ...(p?.banners?.[id] ?? {}),
      },
    ]),
  ) as BannersState["banners"]

  return {
    ...currentState,
    banners,
  }
}

export const useBannersStore = create<BannersStore>()(
  persist(
    (set) => ({
      ...defaultState,
      setBannerVisible: (id, visible, timestamp) =>
        set((state) => {
          return {
            banners: {
              ...state.banners,
              [id]: { ...state.banners[id], visible, timestamp },
            },
          }
        }),
    }),
    {
      name: "banners",
      version: 1,
      merge: mergePersistedWithDefaults,
      partialize: (state) => ({ banners: state.banners }),
    },
  ),
)
