import { WarningMessage } from "components/WarningMessage/WarningMessage"
import { useWarningsStore } from "components/WarningMessage/WarningMessage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-use"
import {
  MIGRATION_TARGET_DOMAIN,
  MIGRATION_TRIGGER_DOMAIN,
  useMigrationStore,
} from "sections/migration/MigrationProvider.utils"
import { MigrationWarning } from "sections/migration/components/MigrationWarning"
import { NewFarmsBanner } from "sections/pools/components/NewFarmsBanner"

export const HeaderBanners = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  const warnings = useWarningsStore()
  const { migrationCompleted, setMigrationCompleted } = useMigrationStore()
  const location = useLocation()

  const shouldShowMigrationWarning =
    isLoaded && MIGRATION_TARGET_DOMAIN === location.host && !migrationCompleted

  return (
    <>
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
      {warnings.warnings.hdxLiquidity.visible && (
        <WarningMessage
          text={t("warningMessage.hdxLiquidity.title")}
          type="hdxLiquidity"
        />
      )}

      {isLoaded && <NewFarmsBanner />}
    </>
  )
}
