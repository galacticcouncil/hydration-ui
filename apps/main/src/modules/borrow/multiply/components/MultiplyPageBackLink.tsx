import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { LINKS } from "@/config/navigation"

export const MultiplyPageBackLink: React.FC = () => {
  return (
    <Button
      variant="muted"
      outline
      icon={ArrowLeft}
      asChild
      sx={{ flexShrink: 0 }}
    >
      <Link to={LINKS.borrowMultiply} />
    </Button>
  )
}
