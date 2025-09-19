import { Warning3D } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Icon,
  ModalBody,
  ModalClose,
  ModalCloseTrigger,
  ModalFooter,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly unclaimable: string
}

export const ClaimStakingWarning: FC<Props> = ({ unclaimable }) => {
  const { t } = useTranslation(["common", "staking"])
  const { native } = useAssets()

  return (
    <>
      <ModalBody>
        <Flex justify="end">
          <ModalClose />
        </Flex>
        <Flex pt={10} pb={30} direction="column" gap={30} align="center">
          <Box
            p={24}
            bg={getToken("accents.alertAlt.dimBg")}
            borderRadius="full"
            width="min-content"
          >
            <Icon component={Warning3D} size={45} />
          </Box>
          <Flex
            direction="column"
            align="center"
            gap={getTokenPx("containers.paddings.tertiary")}
          >
            <Text
              fs="h7"
              color={getToken("text.high")}
              maxWidth={180}
              align="center"
            >
              {t("staking:claim.header")}
            </Text>
            <Text
              fs={12}
              lh={1.3}
              color={getToken("text.medium")}
              align="center"
            >
              <div>{t("staking:claim.description1")}</div>
              <div>
                <Trans
                  t={t}
                  i18nKey="staking:claim.description2"
                  values={{
                    amount: t("number", { value: unclaimable }),
                  }}
                >
                  <span sx={{ color: getToken("accents.alertAlt.primary") }} />
                </Trans>
              </div>
              <Trans
                t={t}
                i18nKey="staking:claim.description3"
                values={{
                  symbol: native.symbol,
                }}
              >
                <span sx={{ color: getToken("accents.alertAlt.primary") }} />
              </Trans>
            </Text>
          </Flex>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Flex width="100%" justify="space-between">
          <Button variant="secondary" size="large" outline>
            <ModalCloseTrigger>{t("cancel")}</ModalCloseTrigger>
          </Button>
          <Button size="large">
            {/* TODO transaction */}
            {t("staking:claim.cta")}
          </Button>
        </Flex>
      </ModalFooter>
    </>
  )
}
