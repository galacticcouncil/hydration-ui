import Warning3D from "@galacticcouncil/ui/assets/images/Warning3D.webp"
import {
  Button,
  Flex,
  Image,
  ModalBody,
  ModalClose,
  ModalFooter,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { useClaimStaking } from "@/modules/staking/ClaimStaking.tx"
import { ClaimStakingRemainder } from "@/modules/staking/ClaimStakingRemainder"

type Props = {
  readonly positionId: bigint
  readonly unclaimable: string
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
  readonly onClose: () => void
}

export const ClaimStakingWarning: FC<Props> = ({
  positionId,
  unclaimable,
  votes,
  votesSuccess,
  onClose,
}) => {
  const { t } = useTranslation(["common", "staking"])

  const claimStaking = useClaimStaking(positionId, votes, votesSuccess)
  const onClaim = (): void => {
    onClose()
    claimStaking.mutate()
  }

  return (
    <>
      <ModalBody>
        <Flex justify="end">
          <ModalClose />
        </Flex>
        <Flex pt={10} pb={20} direction="column" gap={20} align="center">
          <Flex
            bg={getToken("accents.alertAlt.dimBg")}
            borderRadius="full"
            size={94}
            align="center"
            justify="center"
          >
            <Image src={Warning3D} width={45} height={45} />
          </Flex>
          <Flex
            direction="column"
            align="center"
            gap={getTokenPx("containers.paddings.tertiary")}
          >
            <Text
              font="primary"
              fs="h7"
              fw={600}
              lh={1.3}
              color={getToken("text.high")}
              maxWidth={200}
              align="center"
            >
              {t("staking:claim.header")}
            </Text>
            <ClaimStakingRemainder
              sx={{
                fontSize: 12,
                textAlign: "center",
                color: getToken("text.medium"),
              }}
              unclaimable={unclaimable}
              isModal
            />
          </Flex>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Flex width="100%" justify="space-between">
          <Button variant="secondary" size="large" outline onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button size="large" onClick={onClaim}>
            {t("staking:claim.cta")}
          </Button>
        </Flex>
      </ModalFooter>
    </>
  )
}
