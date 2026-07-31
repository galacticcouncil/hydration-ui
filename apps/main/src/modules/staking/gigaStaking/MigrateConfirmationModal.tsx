import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { millisecondsToHours } from "date-fns"
import { Trans, useTranslation } from "react-i18next"

import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import { AssetLogo } from "@/components/AssetLogo"
import { useRpcProvider } from "@/providers/rpcProvider"

export const MigrateConfirmationModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  const { t } = useTranslation(["staking", "common"])
  const rpc = useRpcProvider()
  const { data: gigaStakeConstants } = useQuery(gigaStakeConstantsQuery(rpc))
  const cooldownPeriod = gigaStakeConstants?.cooldownPeriod
  const cooldownPeriodDays = cooldownPeriod
    ? millisecondsToHours(cooldownPeriod * rpc.slotDurationMs) / 24
    : undefined

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalHeader title="Confirmation" customTitle={<></>} closable hidden />
      <ModalBody noPadding scrollable={false} sx={{ pb: pxToRem(40) }}>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="s"
          width={312}
          m="auto"
        >
          <Flex
            align="center"
            justify="center"
            height={95}
            width={95}
            borderRadius="full"
            mb={pxToRem(10)}
            sx={{ backgroundColor: "rgba(183, 183, 183, 0.2)" }}
          >
            <AssetLogo id={HDX_ERC20_ASSET_ID} size="large" />
          </Flex>
          <Text
            fs="h7"
            fw={500}
            lh={1}
            color={getToken("text.high")}
            font="primary"
            align="center"
          >
            {t("gigaStaking.migrate.confirm.title")}
          </Text>
          <Text
            fs="p5"
            fw={400}
            lh={1.4}
            color={getToken("text.medium")}
            align="center"
          >
            <Trans
              t={t}
              i18nKey="gigaStaking.migrate.confirm.desc"
              values={{ days: cooldownPeriodDays ?? "-" }}
              components={[
                <Text
                  key="giga-migration-days"
                  as="span"
                  fs="p5"
                  lh={1.4}
                  color={getToken("text.high")}
                />,
                <br key="giga-migration-br" />,
              ]}
            />
          </Text>
        </Flex>
      </ModalBody>
      <ModalFooter justify="space-between">
        <Button
          variant="secondary"
          size="large"
          onClick={onClose}
          minWidth={120}
        >
          {t("common:cancel")}
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            onConfirm()
            onClose()
          }}
          minWidth={120}
        >
          {t("gigaStaking.migrate.confirm.cta")}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
