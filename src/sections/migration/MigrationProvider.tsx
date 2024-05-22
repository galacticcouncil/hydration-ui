import { FC, PropsWithChildren } from "react"
import { useLocation } from "react-use"
import { MigrationModal } from "./components/MigrationModal"
import { MigrationImport } from "./components/MigrationImport"

import {
  MIGRATION_TRIGGER_URLS,
  MIGRATION_TARGET_URL,
  MIGRATION_QUERY_PARAM,
} from "sections/migration/MigrationProvider.utils"

export const MigrationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { origin, search } = useLocation()

  const urlParams = new URLSearchParams(search)

  const shouldImport =
    MIGRATION_TARGET_URL === origin && urlParams.has(MIGRATION_QUERY_PARAM)
  const shouldMigrate = origin ? MIGRATION_TRIGGER_URLS.includes(origin) : false

  if (shouldImport) {
    return <MigrationImport data={urlParams.get(MIGRATION_QUERY_PARAM) ?? ""} />
  }

  if (shouldMigrate) {
    return <MigrationModal />
  }

  return <>{children}</>
}
