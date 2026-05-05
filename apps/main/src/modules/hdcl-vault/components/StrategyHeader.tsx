import { Chip, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { DecentralLogo } from "./DecentralLogo"

interface Props {
  /** Optional back-link target. Defaults to /borrow. */
  backHref?: string
}

/**
 * Top-of-page header — Figma 6402:24464.
 * Renders breadcrumb (LOOPING > PRIME-HUSD), back arrow, strategy logo + name,
 * and the "RWA LOOP" type pill in the top-right.
 */
export const StrategyHeader = ({ backHref = "/borrow" }: Props) => {
  const { t } = useTranslation("hdcl")
  const breadcrumb = [
    t("strategy.breadcrumb.looping"),
    t("strategy.breadcrumb.prime"),
  ]

  return (
    <Flex direction="column" gap={12}>
      {/* Breadcrumb */}
      <Flex align="center" gap={8}>
        {breadcrumb.map((label, i) => (
          <Flex key={label} align="center" gap={8}>
            <Text fs="p6" fw={500} color={getToken("text.low")} transform="uppercase">
              {label}
            </Text>
            {i < breadcrumb.length - 1 && (
              <Text fs="p6" color={getToken("text.low")}>
                /
              </Text>
            )}
          </Flex>
        ))}
      </Flex>

      {/* Header row */}
      <Flex justify="space-between" align="center" gap={12}>
        <Flex align="center" gap={12}>
          <Link to={backHref} aria-label="Back">
            <Text fs="p3" color={getToken("text.medium")} css={{ cursor: "pointer" }}>
              ←
            </Text>
          </Link>
          <DecentralLogo size={32} />
          <Flex direction="column" gap={2}>
            <Text font="primary" fs="h6" fw={500} color={getToken("text.high")}>
              {t("strategy.name")}
            </Text>
            <Text fs="p5" color={getToken("text.low")}>
              {t("strategy.collateralAsset")}
            </Text>
          </Flex>
        </Flex>
        <Chip>{t("strategy.type")}</Chip>
      </Flex>
    </Flex>
  )
}
