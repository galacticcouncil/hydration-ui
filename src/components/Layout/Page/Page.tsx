import { Header } from "components/Layout/Header/Header"
import { ReactNode, useEffect, useRef } from "react"
import { MobileNavBar } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import {
  SGradientBg,
  SPage,
  SPageContent,
  SPageGrid,
  SPageInner,
  SSubHeader,
} from "./Page.styled"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"
import { useLocation } from "react-use"
import { Interpolation, Theme } from "@emotion/react"

type Props = {
  variant?: "stats" | "default"
  className?: string
  children: ReactNode
  subHeader?: ReactNode
  subHeaderStyle?: Interpolation<Theme>
}

export const Page = ({
  variant = "default",
  className,
  children,
  subHeader,
  subHeaderStyle,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    ref.current?.scrollTo({
      top: 0,
      left: 0,
    })
  }, [location.pathname])

  return (
    <SPage ref={ref}>
      <div>
        {variant === "stats" && <SPageGrid />}
        <Header />
        <SGradientBg variant={variant} />
        <SPageContent>
        {subHeader && (
            <SSubHeader css={subHeaderStyle}>{subHeader}</SSubHeader>
          )}
          <SPageInner className={className}>{children}</SPageInner>
          <ProviderSelectButton />
        </SPageContent>
        <MobileNavBar />
      </div>
    </SPage>
  )
}
