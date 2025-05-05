import { createIndexedDBStore, IndexedDBStores } from "@/utils/indexedDB"

export type ApiMetadata = Record<string, `0x${string}`>

type ApiMetadataStore = {
  metadata: ApiMetadata
  setMetadata: (metadata: ApiMetadata) => void
}

export const useApiMetadataStore = createIndexedDBStore<ApiMetadataStore>(
  IndexedDBStores.ApiMetadata,
  (set) => ({
    metadata: {},
    setMetadata: (metadata: ApiMetadata) => {
      set((state) => ({
        ...state,
        metadata,
      }))
    },
  }),
)
