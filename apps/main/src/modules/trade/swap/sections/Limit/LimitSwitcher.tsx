import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { ButtonTransparent, Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { ArrowDown } from "lucide-react"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useSwitchAssets } from "@/modules/trade/swap/sections/Limit/useSwitchAssets"

export const LimitSwitcher: FC = () => {
  const { watch } = useFormContext<LimitFormValues>()

  const [sellAsset] = watch(["sellAsset"])

  const switchAssets = useSwitchAssets()

  const isDisabled =
    switchAssets.isPending ||
    (!!sellAsset && SELL_ONLY_ASSETS.includes(sellAsset.id))

  return (
    <SSwitcherRow align="center" sx={{ mx: -20 }}>
      <SLineShort />
      <SFlipButton onClick={() => switchAssets.mutate()} disabled={isDisabled}>
        <Icon
          size="m"
          component={ArrowDown}
          color={getToken("icons.primary")}
        />
      </SFlipButton>
      <SLine />
    </SSwitcherRow>
  )
}

// ── Styled components ──

const SSwitcherRow = styled(Flex)`
  position: relative;
`

const SLineShort = styled.div(
  ({ theme }) => css`
    flex-shrink: 0;
    width: 32px;
    height: 1px;
    background: ${theme.details.borders};
  `,
)

const SLine = styled.div(
  ({ theme }) => css`
    flex: 1;
    height: 1px;
    background: ${theme.details.borders};
  `,
)

const SFlipButton = styled(ButtonTransparent)(
  ({ theme }) => css`
    border-radius: ${theme.radii.full};
    padding: 8px;
    background: ${theme.controls.dim.base};
    transition: ${theme.transitions.transform};

    &:hover:not([disabled]) {
      background: ${theme.controls.dim.hover};
      transform: rotate(180deg);
    }

    &[disabled] {
      cursor: not-allowed;
    }
  `,
)
