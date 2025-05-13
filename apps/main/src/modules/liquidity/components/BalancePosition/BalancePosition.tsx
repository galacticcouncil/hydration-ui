import { Minus, Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Paper,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"
import { OmnipoolAssetTable } from "@/modules/liquidity/Liquidity.utils"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { toBig } from "@/utils/helpers"

type BalancePositionProps = {
  label: string
  pool: OmnipoolAssetTable
}

export const BalancePosition = ({ label, pool }: BalancePositionProps) => {
  const { t } = useTranslation(["common", "liquidity"])
  const freeBalance = pool.balance
    ? scaleHuman(pool.balance.free.toString(), pool.meta.decimals)
    : undefined
  const { price, isValid } = useAssetPrice(freeBalance ? pool.id : undefined)

  if (!freeBalance) return null

  return (
    <>
      <SectionHeader>{label}</SectionHeader>

      <Flex
        as={Paper}
        justify="space-between"
        gap={12}
        p={getTokenPx("containers.paddings.primary")}
        direction={["column", "row"]}
      >
        <Flex
          gap={[12, 60]}
          align={["flex-start", "center"]}
          direction={["column", "row"]}
        >
          <Logo id={pool.id} />
          <Amount
            label={t("liquidity:liquidity.stablepool.position.currentValue")}
            value={t("number", { value: freeBalance })}
            displayValue={
              isValid
                ? t("currency", {
                    value: toBig(price)?.times(freeBalance).toString(),
                  })
                : "-"
            }
          />
        </Flex>
        <Flex gap={12} align="center">
          <Button variant="primary" sx={{ flex: [1, "auto"] }}>
            <Plus />
            {t("liquidity:liquidity.stablepool.position.addPosition")}
          </Button>
          <Button variant="tertiary" outline sx={{ flex: [1, "auto"] }}>
            <Minus />
            {t("liquidity:liquidity.stablepool.position.removeLiquidity")}
          </Button>
        </Flex>
      </Flex>
    </>
  )
}
