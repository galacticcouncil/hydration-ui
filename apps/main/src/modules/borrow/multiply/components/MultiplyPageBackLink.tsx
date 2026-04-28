import { ButtonIcon, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { LINKS } from "@/config/navigation"

export const MultiplyPageBackLink: React.FC = () => {
  return (
    <ButtonIcon asChild sx={{ flexShrink: 0 }}>
      <Link to={LINKS.borrowMultiply}>
        <Icon component={ArrowLeft} size="xl" color={getToken("text.high")} />
      </Link>
    </ButtonIcon>
  )
}
