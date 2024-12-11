import {
  Box,
  Flex,
  FlexProps,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"

import { DetailedLink } from "@/components/DetailedLink"
import { NAVIGATION } from "@/config/navigation"
import { SHeaderMenuItem } from "@/modules/layout/components/HeaderMenu.styled"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

export const HeaderMenu: React.FC<FlexProps> = (props) => {
  const translations = useMenuTranslations()
  return (
    <Flex gap={4} {...props}>
      {NAVIGATION.map(({ key, to, children, order }) => (
        <HoverCard key={key}>
          <Box py={6}>
            {children ? (
              <>
                <HoverCardTrigger asChild>
                  <SHeaderMenuItem sx={{ order }} asChild>
                    <Link to={to}>{translations[key].title}</Link>
                  </SHeaderMenuItem>
                </HoverCardTrigger>
                <HoverCardContent
                  borderRadius="xxl"
                  sideOffset={10}
                  alignOffset={-40}
                >
                  {children.map(({ key, to, icon }) => (
                    <DetailedLink
                      key={key}
                      to={to}
                      title={translations[key].title}
                      description={translations[key].description}
                      icon={icon}
                    />
                  ))}
                </HoverCardContent>
              </>
            ) : (
              <SHeaderMenuItem sx={{ order }} asChild>
                <Link to={to}>{translations[key].title}</Link>
              </SHeaderMenuItem>
            )}
          </Box>
        </HoverCard>
      ))}
    </Flex>
  )
}
