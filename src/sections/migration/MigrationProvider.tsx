import { FC, PropsWithChildren, useState } from "react"
import { useLocation } from "react-use"
import { MigrationExportModal } from "./components/MigrationExportModal"
import { MigrationImportModal } from "./components/MigrationImportModal"

import {
  MIGRATION_TRIGGER_DOMAIN,
  MIGRATION_TARGET_DOMAIN,
  MIGRATION_QUERY_PARAM,
  MIGRATION_LS_KEYS,
  serializeLocalStorage,
} from "sections/migration/MigrationProvider.utils"

export const MigrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { origin, search, hostname } = useLocation()

  const [migrationCanceled, setMigrationCanceled] = useState(false)

  const paramKey = `?${MIGRATION_QUERY_PARAM}=`
  const data = search?.replace(paramKey, "") ?? ""

  const shouldExport = MIGRATION_TRIGGER_DOMAIN === hostname
  const shouldImport =
    MIGRATION_TARGET_DOMAIN === origin && search?.startsWith(paramKey)

  if (shouldImport) {
    return <MigrationImportModal data={data} />
  }

  if (shouldExport && !migrationCanceled) {
    return (
      <MigrationExportModal
        data={serializeLocalStorage(MIGRATION_LS_KEYS)}
        onCancel={() => {
          setMigrationCanceled(true)
        }}
      />
    )
  }

  return <>{children}</>
}
