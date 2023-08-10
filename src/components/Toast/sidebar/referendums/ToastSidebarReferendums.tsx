import { useReferendums } from "api/democracy"
import { ReferendumCard } from "components/ReferendumCard/ReferendumCard"
import { useTranslation } from "react-i18next"
import { ToastSidebarGroup } from "../group/ToastSidebarGroup"

export const ToastSidebarReferendums = () => {
  const { t } = useTranslation()
  const referendums = useReferendums("ongoing")

  if (!referendums.data?.length) return null

  return (
    <ToastSidebarGroup title={t("toast.sidebar.referendums.title")}>
      <div sx={{ flex: "column", gap: 8 }}>
        {referendums.data.map((referendum) => (
          <ReferendumCard key={referendum.id} type="toast" {...referendum} />
        ))}
      </div>
    </ToastSidebarGroup>
  )
}
