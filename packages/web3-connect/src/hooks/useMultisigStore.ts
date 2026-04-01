import { createZustandStorage } from "@galacticcouncil/utils"
import { z } from "zod/v4"
import { create } from "zustand"
import { persist } from "zustand/middleware"

const multisigConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  signers: z.array(z.string()),
  threshold: z.number(),
  address: z.string(),
})

const multisigStateSchema = z.object({
  configs: z.array(multisigConfigSchema),
  activeConfigId: z.string().nullable(),
  activeSignerAddress: z.string().nullable(),
})

export type MultisigConfig = z.infer<typeof multisigConfigSchema>
type MultisigState = z.infer<typeof multisigStateSchema>

export type MultisigStore = MultisigState & {
  add: (config: Omit<MultisigConfig, "id">) => void
  remove: (id: string) => void
  setActive: (id: string | null, signerAddress: string | null) => void
  getActiveConfig: () => MultisigConfig | null
  clear: () => void
}

const defaultState: MultisigState = {
  configs: [],
  activeConfigId: null,
  activeSignerAddress: null,
}

export const useMultisigStore = create<MultisigStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      add: (config) =>
        set((state) => ({
          configs: [...state.configs, { ...config, id: crypto.randomUUID() }],
        })),
      remove: (id) =>
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          activeConfigId:
            state.activeConfigId === id ? null : state.activeConfigId,
          activeSignerAddress:
            state.activeConfigId === id ? null : state.activeSignerAddress,
        })),
      setActive: (id, signerAddress) =>
        set({ activeConfigId: id, activeSignerAddress: signerAddress }),
      getActiveConfig: () => {
        const { configs, activeConfigId } = get()
        return configs.find((c) => c.id === activeConfigId) ?? null
      },
      clear: () => set(defaultState),
    }),
    createZustandStorage({
      name: "multisig-configs",
      version: 1,
      schema: multisigStateSchema,
      defaultState,
      migrate: (persistedState) => persistedState as MultisigState,
    }),
  ),
)
