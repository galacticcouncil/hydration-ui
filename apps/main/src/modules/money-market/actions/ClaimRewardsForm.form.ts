import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { Address, isAddress } from "viem"
import * as z from "zod/v4"

const schema = z.object({
  reward: z.union([
    z.literal("all"),
    z.custom<Address>((value) => typeof value === "string" && isAddress(value)),
  ]),
})

export type ClaimRewardsFormValues = z.infer<typeof schema>

/** No default reward — the form picks one once the claimable list is known. */
export const useClaimRewardsForm = () =>
  useForm<ClaimRewardsFormValues>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
