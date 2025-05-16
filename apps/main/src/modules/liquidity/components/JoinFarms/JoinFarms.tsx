import {
  Amount,
  Button,
  Flex,
  ModalBody,
  ModalContainer,
  ModalContentDivider,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { AvailableFarms } from "@/modules/liquidity/components/AvailableFarms"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountOmnipoolPositionsData } from "@/states/account"

type JoinFarmsProps = {
  positionId: string
  poolId: string
}

const farms = [
  { id: 0, assetId: "5" },
  { id: 1, assetId: "0" },
]

export const JoinFarms = ({ positionId, poolId }: JoinFarmsProps) => {
  const { t } = useTranslation(["liquidity", "common"])
  const { getAssetWithFallback } = useAssets()
  const meta = getAssetWithFallback(poolId)

  const { getAssetPositions } = useAccountOmnipoolPositionsData()
  const { omnipool } = getAssetPositions(poolId)
  const position = omnipool.find(
    (position) => position.positionId === positionId,
  )

  return (
    <Flex justify="center" mt={getTokenPx("containers.paddings.primary")}>
      <ModalContainer open sx={{ width: 520 }}>
        <ModalHeader title={t("joinFarms")} closable={false} />
        <ModalBody>
          <AvailableFarms farms={farms} />
          <form autoComplete="off">
            <ModalContentDivider
              sx={{ mt: getTokenPx("containers.paddings.primary") }}
            />

            {
              <Flex
                direction="column"
                gap={getTokenPx("containers.paddings.quart")}
                py={getTokenPx("containers.paddings.secondary")}
              >
                <Text
                  fs={14}
                  fw={500}
                  font="primary"
                  color={getToken("text.high")}
                >
                  {t("liquidity.joinFarms.modal.currentPositionValue")}
                </Text>
                <Flex align="center" justify="space-between" gap={8}>
                  <Text
                    color={getToken("text.medium")}
                    fs="p5"
                    fw={400}
                    width={220}
                  >
                    {t("liquidity.joinFarms.modal.description")}
                  </Text>
                  {position?.data ? (
                    <Amount
                      value={t("common:currency", {
                        value: position.data.currentTotalValueHuman,
                        symbol: meta.symbol,
                      })}
                      displayValue={t("common:currency", {
                        value: position.data.currentTotalDisplay,
                      })}
                      size="large"
                    />
                  ) : null}
                </Flex>
              </Flex>
            }

            <ModalContentDivider />

            <Button
              type="submit"
              size="large"
              width="100%"
              mt={getTokenPx("containers.paddings.primary")}
              disabled={false}
            >
              {t("liquidity.joinFarms.modal.submit", {
                amount: farms.length,
              })}
            </Button>
          </form>
        </ModalBody>
      </ModalContainer>
    </Flex>
  )
}
