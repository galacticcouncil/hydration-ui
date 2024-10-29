import { useTranslation } from "react-i18next"

export const LiquidityPage = () => {
  const { t } = useTranslation(["liquidity"])
  return (
    <div>
      <h1>{t("liquidity:title")}</h1>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
        laudantium voluptates ipsa temporibus quibusdam animi nostrum in ut
        magni, reprehenderit vel architecto quisquam, fugit eum, assumenda
        delectus soluta repellat voluptatibus.
      </p>
    </div>
  )
}
