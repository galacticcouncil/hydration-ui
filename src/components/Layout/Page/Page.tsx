import { Header } from "components/Layout/Header/Header"
import { ReactNode, useEffect, useRef } from "react"
import { MobileNavBar } from "components/Layout/Header/MobileNavBar/MobileNavBar"
import {
  SGradientBg,
  SPage,
  SPageContent,
  SPageInner,
  SSubHeader,
} from "./Page.styled"
import { useLocation } from "react-use"
import { Interpolation, Theme } from "@emotion/react"
import { Web3Connect } from "sections/web3-connect/Web3Connect"
import { ReferralsConnect } from "sections/referrals/ReferralsConnect"
import { useRpcProvider } from "providers/rpcProvider"
import { MigrationWarning } from "sections/migration/components/MigrationWarning"
import {
  MIGRATION_TARGET_DOMAIN,
  MIGRATION_TRIGGER_DOMAIN,
  useMigrationStore,
} from "sections/migration/MigrationProvider.utils"
import { HeaderWarning } from "components/Layout/Header/warning/HeaderWarning"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMatchRoute } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"

type Props = {
  className?: string
  children: ReactNode
  subHeader?: ReactNode
  subHeaderStyle?: Interpolation<Theme>
}

export const Page = ({
  className,
  children,
  subHeader,
  subHeaderStyle,
}: Props) => {
  const { t } = useTranslation()
  const { featureFlags, isLoaded } = useRpcProvider()
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { migrationCompleted, setMigrationCompleted } = useMigrationStore()
  const matchRoute = useMatchRoute()
  const isXcmPage = matchRoute({ to: LINKS.cross_chain })

  useEffect(() => {
    ref.current?.scrollTo({
      top: 0,
      left: 0,
    })
  }, [location.pathname])

  const shouldShowMigrationWarning =
    isLoaded && MIGRATION_TARGET_DOMAIN === location.host && !migrationCompleted

  return (
    <>
      {isXcmPage && (
        <HeaderWarning>
          <Text fs={[13, 16]}>{t("header.warning.xcmDisabled")}</Text>
        </HeaderWarning>
      )}
      {shouldShowMigrationWarning && (
        <MigrationWarning
          onClick={() =>
            (window.location.href = `https://${MIGRATION_TRIGGER_DOMAIN}?from=${MIGRATION_TARGET_DOMAIN}`)
          }
          onClose={() => {
            setMigrationCompleted(new Date().toISOString())
          }}
        />
      )}
      <SPage ref={ref}>
        <div
          sx={{ flex: "column", height: "100%" }}
          css={{ position: "relative" }}
        >
          <SGradientBg />
          <Header />
          <SPageContent>
            {subHeader && (
              <SSubHeader css={subHeaderStyle}>{subHeader}</SSubHeader>
            )}
            <SPageInner className={className}>{children}</SPageInner>
          </SPageContent>
          <MobileNavBar />
        </div>
      </SPage>
      <Web3Connect />
      {featureFlags.referrals && <ReferralsConnect />}
    </>
  )
}
