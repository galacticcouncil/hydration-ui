import { Spacer } from "components/Spacer/Spacer"
import { SContent } from "./MemepadLayout.styled"
import { MemepadHeader } from "sections/memepad/components/MemepadHeader"
import { MemepadVisual } from "sections/memepad/components/MemepadVisual"

export const MemepadLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <MemepadHeader />
      <Spacer size={35} />
      <SContent>
        <div>{children}</div>
        <MemepadVisual />
      </SContent>
    </>
  )
}
