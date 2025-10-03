import {
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const JoinFarmsSkeleton = ({ closable }: { closable?: boolean }) => {
  const { t } = useTranslation("liquidity")

  return (
    <>
      <ModalHeader title={t("joinFarms")} closable={closable} />
      <ModalBody>
        <Skeleton height={150} width="100%" />

        <ModalContentDivider
          sx={{ mt: getTokenPx("containers.paddings.primary") }}
        />

        <Flex
          direction="column"
          gap={getTokenPx("containers.paddings.quart")}
          py={getTokenPx("containers.paddings.secondary")}
        >
          <Text fs={14} fw={500} font="primary" color={getToken("text.high")}>
            {t("liquidity.joinFarms.modal.currentPositionValue")}
          </Text>
          <Flex align="center" justify="space-between" gap={8}>
            <Text color={getToken("text.medium")} fs="p5" fw={400} width={220}>
              {t("liquidity.joinFarms.modal.description")}
            </Text>
          </Flex>
        </Flex>

        <ModalContentDivider />

        <Button
          size="large"
          width="100%"
          mt={getTokenPx("containers.paddings.primary")}
          disabled
        >
          {t("joinFarms")}
        </Button>
      </ModalBody>
    </>
  )
}
