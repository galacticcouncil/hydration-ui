import {
  Button,
  Flex,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const JoinFarmsSkeleton = ({ closable }: { closable?: boolean }) => {
  const { t } = useTranslation("liquidity")

  return (
    <>
      <ModalHeader title={t("joinFarms")} closable={closable} />
      <ModalBody>
        <Skeleton height={150} width="100%" />

        <ModalContentDivider sx={{ mt: "xxl" }} />

        <Flex direction="column" gap="base" py="l">
          <Text fs="p3" fw={500} font="primary" color={getToken("text.high")}>
            {t("liquidity.joinFarms.modal.currentPositionValue")}
          </Text>
          <Flex align="center" justify="space-between" gap="base">
            <Text color={getToken("text.medium")} fs="p5" fw={400} width={220}>
              {t("liquidity.joinFarms.modal.description")}
            </Text>
          </Flex>
        </Flex>

        <ModalContentDivider />

        <Button size="large" width="100%" mt="xxl" disabled>
          {t("joinFarms")}
        </Button>
      </ModalBody>
    </>
  )
}
