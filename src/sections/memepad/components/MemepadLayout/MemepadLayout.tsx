import { Spacer } from "components/Spacer/Spacer"
import { SContent } from "./MemepadLayout.styled"
import { MemepadHeader } from "sections/memepad/components/MemepadHeader"
import {
  MemepadVisual,
  MemepadVisualMobile,
} from "sections/memepad/components/MemepadVisual"
import { useMedia } from "react-use"
import { theme } from "theme"

export const MemepadLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const isDesktop = useMedia(theme.viewport.gte.md)
  return (
    <>
      <MemepadHeader />
      <Spacer size={35} />
      <SContent>
        <div>{children}</div>
        {isDesktop ? (
          <MemepadVisual animmated variant="a" sx={{ mt: -200, ml: 80 }} />
        ) : (
          <MemepadVisualMobile
            sx={{
              top: 0,
              right: 0,
              width: [75, "25%"],
            }}
            css={{ position: "absolute" }}
          />
        )}
      </SContent>
    </>
  )
}
