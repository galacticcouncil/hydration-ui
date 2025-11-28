import { ModalContainer } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { isSS58Address } from "@galacticcouncil/utils"
import {
  createFileRoute,
  useParams,
  useRouter,
  useSearch,
} from "@tanstack/react-router"
import { z } from "zod/v4"

import { AddIsolatedLiquidity } from "@/modules/liquidity/components/AddIsolatediquidity"
import { AddLiquidity } from "@/modules/liquidity/components/AddLiquidity"
import { AddStablepoolLiquidityWrapper } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"

const AddLiquiditySchema = z.object({
  stableswapId: z.string().optional(),
  erc20Id: z.string().optional(),
  split: z.boolean().optional(),
})

export type AddLiquidityType = z.infer<typeof AddLiquiditySchema>

export type AddLiquidityProps = AddLiquidityType & {
  id: string
  onBack?: () => void
  closable?: boolean
}

export const Route = createFileRoute("/liquidity/$id/add")({
  validateSearch: AddLiquiditySchema,
  component: function Component() {
    const { id } = useParams({ from: "/liquidity/$id/add" })

    const search = useSearch({
      from: "/liquidity/$id/add",
    })

    const { history } = useRouter()

    return (
      <ModalContainer
        open
        sx={{ m: "auto", mt: getTokenPx("containers.paddings.primary") }}
      >
        <AddLiquidityModalContent
          id={id}
          closable={false}
          onBack={() => history.back()}
          {...search}
        />
      </ModalContainer>
    )
  },
})

export function AddLiquidityModalContent(props: AddLiquidityProps) {
  if (isSS58Address(props.id)) {
    return <AddIsolatedLiquidity {...props} />
  } else if (props.stableswapId) {
    return (
      <AddStablepoolLiquidityWrapper
        {...props}
        stableswapId={props.stableswapId}
      />
    )
  }

  return <AddLiquidity {...props} />
}
