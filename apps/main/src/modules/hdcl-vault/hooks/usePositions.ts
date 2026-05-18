import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract } from "viem"

import {
  VAULT_ABI,
  VAULT_ADDRESS,
  vaultEvmClient,
} from "@/modules/hdcl-vault/constants"

export interface Position {
  id: number
  tokenId: number
  principal: number
  apyPercent: number
  depositTime: Date
  maturityTime: Date
  timeRemainingDays: number
  state: number
}

export function usePositions() {
  return useQuery({
    queryKey: ["hdcl-vault-positions"],
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
      })

      const [count, head] = await Promise.all([
        vault.read.getPositionCount(),
        vault.read.getPositionHead(),
      ])

      const posCount = Number(count)
      const posHead = Number(head)

      if (posCount <= posHead) return [] as Position[]

      const positions: Position[] = []
      const now = Date.now() / 1000

      for (let i = posHead; i < posCount; i++) {
        const result = await vault.read.getPosition([BigInt(i)])
        const [tokenId, principal, apyWad, depositTime, maturityTime, state] =
          result

        const matSec = Number(maturityTime)
        const remaining = Math.max(0, matSec - now)

        positions.push({
          id: i,
          tokenId: Number(tokenId),
          principal: Number(formatUnits(principal, 18)),
          apyPercent: Number(formatUnits(apyWad, 16)),
          depositTime: new Date(Number(depositTime) * 1000),
          maturityTime: new Date(matSec * 1000),
          timeRemainingDays: Math.ceil(remaining / 86400),
          state,
        })
      }

      return positions
    },
    refetchInterval: 60_000,
  })
}
