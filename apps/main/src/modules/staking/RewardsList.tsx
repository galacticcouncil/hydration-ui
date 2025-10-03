import {
  Box,
  Button,
  Flex,
  ModalContent,
  ModalRoot,
  ModalTrigger,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { ClaimStakingWarning } from "@/modules/staking/ClaimStakingWarning"
import { RewardsCurve } from "@/modules/staking/RewardsCurve"
import { useAssets } from "@/providers/assetsProvider"

// TODO integrate
const available = 222455
const unclaimable = "2256"
const percent = 1.5

export const RewardsList: FC = () => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  const [availableDisplay] = useDisplayAssetPrice(native.id, available)

  return (
    <Box>
      <Flex
        px={getTokenPx("containers.paddings.primary")}
        py={getTokenPx("containers.paddings.primary")}
        bg={getToken("surfaces.containers.mid.primary")}
        borderWidth={1}
        borderStyle="solid"
        borderColor={getToken("buttons.secondary.low.onOutline")}
        borderRadius={getTokenPx("containers.cornerRadius.containersPrimary")}
        align="center"
      >
        <Flex direction="column" gap={20}>
          <Text fw={500} fs={16} lh={1.2} color={getToken("text.high")}>
            {t("staking:dashboard.available")}
          </Text>
          <Flex direction="column" gap={22}>
            <Flex direction="column" gap={2}>
              <Text fw={700} fs={24} lh={1} color={getToken("text.high")}>
                {t("currency", { value: available, symbol: native.symbol })}
              </Text>
              <Text fs={14} lh={1.4} color={getToken("text.onTint")}>
                ≈{availableDisplay}
              </Text>
            </Flex>
            <Flex direction="column" gap={2}>
              <Text fw={700} fs={24} lh={1} color={getToken("text.high")}>
                {t("percent", { value: percent })}
              </Text>
              <Text fs={14} lh={1.4} color={getToken("text.onTint")}>
                {t("staking:dashboard.ofAllocatred")}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <RewardsCurve />
      </Flex>
      <Flex
        px={getTokenPx("containers.paddings.primary")}
        py={getTokenPx("containers.paddings.tertiary")}
        bg={getToken("accents.info.primary")}
        align="center"
        justify="space-between"
      >
        <Box>
          {(
            t("staking:dashboard.remainder", {
              returnObjects: true,
              amount: t("number", { value: unclaimable }),
              symbol: native.symbol,
            }) as Array<string>
          ).map((line, index) => (
            <Text key={index} fs={14} lh={1.3} color={getToken("text.high")}>
              {line}
            </Text>
          ))}
        </Box>
        <ModalRoot>
          <Button variant="secondary" asChild>
            <ModalTrigger>
              {/* TODO integrate */}
              {t("claim")}
            </ModalTrigger>
          </Button>
          <ModalContent>
            <ClaimStakingWarning unclaimable={unclaimable} />
          </ModalContent>
        </ModalRoot>
      </Flex>
    </Box>
  )
}
