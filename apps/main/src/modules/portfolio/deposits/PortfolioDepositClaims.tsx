import { ArrowDownToLineIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Chip,
  Flex,
  Modal,
  Paper,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, Fragment, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useClaimableDeposits } from "@/modules/onramp/deposit/hooks/useClaimableDeposits"
import { JourneyAssetLogo } from "@/modules/xcm/history/components/JourneyAssetLogo"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { getTransferAsset } from "@/modules/xcm/history/utils/assets"
import { resolveChainFromUrn } from "@/modules/xcm/history/utils/claim"
import { toDecimal } from "@/utils/formatting"

import {
  PortfolioDepositClaimDetail,
  PortfolioDepositClaimDetailProps,
} from "./PortfolioDepositClaimDetail"

export const PortfolioDepositClaims: FC = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const claims = useClaimableDeposits()
  const [selected, setSelected] =
    useState<PortfolioDepositClaimDetailProps | null>(null)
  const pendingIds = usePendingClaimsStore(
    (state) => state.pendingCorrelationIds,
  )
  const selectedPending =
    !!selected && pendingIds.includes(selected.journey.correlationId)

  useEffect(() => {
    if (selectedPending) setSelected(null)
  }, [selectedPending])

  return (
    <>
      {claims.length > 0 && (
        <Paper
          overflow="hidden"
          sx={{ bg: getToken("buttons.secondary.accent.rest") }}
          as="section"
          aria-label={t("deposit.portfolio.claims.title")}
        >
          <Flex px="l" py="m" align="center" gap="s">
            <ArrowDownToLineIcon size={16} />
            <Text as="h2" fs="p3" fw={500}>
              {t("deposit.portfolio.claims.title")}
            </Text>
            <Chip variant="green" size="small" rounded>
              {t("common:number", { value: claims.length })}
            </Chip>
          </Flex>
          {claims.map((journey) => {
            const asset = getTransferAsset(journey)
            const source = resolveChainFromUrn(journey.origin)
            return (
              <Fragment key={journey.correlationId}>
                <Separator />
                <Flex
                  px="l"
                  py="m"
                  gap="l"
                  justify="space-between"
                  align="center"
                >
                  <Flex gap="m" align="center">
                    {asset && (
                      <JourneyAssetLogo assetKey={asset.asset} size="small" />
                    )}
                    <Stack gap="xs" justify="flex-start">
                      <Text fs="p4" fw={500}>
                        {asset
                          ? t("common:currency", {
                              value: toDecimal(asset.amount, asset.decimals),
                              symbol: asset.symbol,
                            })
                          : t("common:deposit")}
                      </Text>
                      <Text fs="p6" color={getToken("text.medium")}>
                        {t("deposit.portfolio.claims.from", {
                          chain: source?.name ?? t("common:unknown"),
                        })}
                      </Text>
                    </Stack>
                  </Flex>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      account &&
                      setSelected({ journey, address: account.rawAddress })
                    }
                  >
                    {t("common:claim")}
                  </Button>
                </Flex>
              </Fragment>
            )
          })}
        </Paper>
      )}
      <Modal
        variant="popup"
        open={!!selected && !selectedPending}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && <PortfolioDepositClaimDetail {...selected} />}
      </Modal>
    </>
  )
}
