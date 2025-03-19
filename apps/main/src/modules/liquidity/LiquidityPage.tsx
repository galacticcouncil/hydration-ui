import { Button, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { omnipoolTokens } from "@/api/pools"
import { useToasts } from "@/states/toasts"

export const LiquidityPage = () => {
  const { t } = useTranslation(["liquidity"])
  const { data: omnipool } = useQuery(omnipoolTokens)
  const { successToast } = useToasts()
  console.log(omnipool)
  return (
    <div>
      <Text as="h1" fs={40} fw={600} font="primary">
        {t("liquidity:title")}
      </Text>
      <Button
        onClick={() => {
          successToast({ title: "I am a new success notification" })
        }}
      >
        Display Notification
      </Button>
      {Array.from({ length: 100 }).map((_, i) => (
        <Text key={i} mt={20} color={getToken("text.medium")}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
          laudantium voluptates ipsa temporibus quibusdam animi nostrum in ut
          magni, reprehenderit vel architecto quisquam, fugit eum, assumenda
          delectus soluta repellat voluptatibus.
        </Text>
      ))}
    </div>
  )
}
