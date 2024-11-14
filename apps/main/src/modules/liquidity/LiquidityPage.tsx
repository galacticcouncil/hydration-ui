import { Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const LiquidityPage = () => {
  const { t } = useTranslation(["liquidity"])
  return (
    <div>
      <Text as="h1" fs={40} fw={600} font="Primary-Font">
        {t("liquidity:title")}
      </Text>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
        laudantium voluptates ipsa temporibus quibusdam animi nostrum in ut
        magni, reprehenderit vel architecto quisquam, fugit eum, assumenda
        delectus soluta repellat voluptatibus.
      </p>
    </div>
  )
}
