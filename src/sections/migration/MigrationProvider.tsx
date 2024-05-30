import { FC, PropsWithChildren, useState } from "react"
import { useLocation } from "react-use"
import { MigrationExportModal } from "./components/MigrationExportModal"
import { MigrationImportModal } from "./components/MigrationImportModal"

import {
  MIGRATION_TRIGGER_URL,
  MIGRATION_TARGET_URL,
  MIGRATION_QUERY_PARAM,
  MIGRATION_LS_KEYS,
  serializeLocalStorage,
  MIGRATION_CANCELED_FLAG,
} from "sections/migration/MigrationProvider.utils"

export const MigrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { origin, search } = useLocation()

  const [migrationCanceled, setMigrationCanceled] = useState(
    localStorage.getItem(MIGRATION_CANCELED_FLAG) === "true",
  )

  const paramKey = `?${MIGRATION_QUERY_PARAM}=`
  const data = search?.replace(paramKey, "") ?? ""

  const shouldExport = MIGRATION_TRIGGER_URL === origin
  const shouldImport =
    MIGRATION_TARGET_URL === origin && search?.startsWith(paramKey)

  if (shouldImport) {
    return <MigrationImportModal data={data} />
  }

  if (shouldExport && !migrationCanceled) {
    return (
      <MigrationExportModal
        data={serializeLocalStorage(MIGRATION_LS_KEYS)}
        onCancel={() => {
          localStorage.setItem(MIGRATION_CANCELED_FLAG, "true")
          setMigrationCanceled(true)
        }}
      />
    )
  }

  return <>{children}</>
}
