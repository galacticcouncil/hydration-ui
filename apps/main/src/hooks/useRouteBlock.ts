import { useBlocker } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

type UseRouteBlockOptions = {
  when: boolean
}

export const useRouteBlock = ({ when }: UseRouteBlockOptions) => {
  const { t } = useTranslation()

  const message = t("unsavedChanges")

  useBlocker({
    enableBeforeUnload: when,
    shouldBlockFn: () => {
      if (!when) return false
      const shouldLeave = window.confirm(message)
      return !shouldLeave
    },
  })
}
