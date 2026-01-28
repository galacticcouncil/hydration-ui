import Casette from "@galacticcouncil/ui/assets/images/Casette.webp"
import { Button, Flex, Image, Text } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Page404 = () => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" align="center" justify="center" py="10vh">
      <Image src={Casette} alt="Page not found" width={150} height={150} />
      <Text as="h1" font="primary" fs={[30, null, 40]} align="center" mb="xl">
        {t("page404.title")}
      </Text>
      <Button variant="secondary" asChild>
        <Link to="/">{t("page404.goBackToHome")}</Link>
      </Button>
    </Flex>
  )
}
