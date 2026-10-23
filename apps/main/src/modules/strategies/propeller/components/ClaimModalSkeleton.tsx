import {
  Button,
  Flex,
  ModalBody,
  ModalFooter,
  Separator,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { type FC } from "react"
import { useTranslation } from "react-i18next"

import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { getPayoutAssetIds } from "@/modules/strategies/propeller/utils/payout"

import { ClaimModalPosition } from "./ClaimModalPosition"

type ClaimModalSkeletonProps = {
  row: PropellerWithdrawalRow
}

export const ClaimModalSkeleton: FC<ClaimModalSkeletonProps> = ({ row }) => {
  const { t } = useTranslation("propeller")

  return (
    <>
      <ModalBody>
        <Flex direction="column" gap="l">
          <ClaimModalPosition row={row} />
          <Text fs="p4" fw={500}>
            {t("withdrawals.claimModal.receiveAs")}
          </Text>
          <Flex direction="column" gap="s">
            {getPayoutAssetIds(row.vault).map((id) => (
              <Skeleton key={id} height={56} />
            ))}
          </Flex>
        </Flex>
      </ModalBody>
      <Separator />
      <ModalFooter>
        <Button size="large" width="100%" disabled>
          <Skeleton width={120} height="1em" />
        </Button>
      </ModalFooter>
    </>
  )
}
