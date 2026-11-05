import { Flex, Image, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import hollarIcon from "@/assets/ramp/Hollar.svg"

type BankDepositV3ReceiveProps = { amount: string }

export const BankDepositV3Receive: FC<BankDepositV3ReceiveProps> = ({
  amount,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  return (
    <Stack gap="base">
      <Text font="primary" fs="p3" color={getToken("text.tint.secondary")}>
        {t("bankV3.deposit.receiveEstimate")}
      </Text>
      <Flex
        align="center"
        gap="m"
        p="l"
        borderRadius="m"
        bg={getToken("surfaces.containers.dim.dimOnHigh")}
      >
        <Image
          src={hollarIcon}
          alt=""
          aria-hidden
          lazy={false}
          sx={{ size: pxToRem(30), flexShrink: 0 }}
        />
        <Stack gap="xs" flex={1}>
          <Text fs="p3" fw={600}>
            HOLLAR
          </Text>
          <Text fs="p5" color={getToken("text.medium")}>
            Hydration
          </Text>
        </Stack>
        <Text fs="p2" fw={500}>
          {t("common:number", { value: amount || "0" })}
        </Text>
      </Flex>
    </Stack>
  )
}
