import { Spinner } from '../../Spinner/Spinner.styled'
import { SActiveReferendumIcon, SBellIcon, SWrap } from './Bell.styled'
import { InfoTooltip } from '../../InfoTooltip/InfoTooltip'
import { useToast } from '../../../state/toasts'
import { useTranslation } from 'react-i18next'
import { useReferendums } from '../../../api/democracy'

export const Bell = () => {
  const { setSidebar, toasts } = useToast()
  const { t } = useTranslation()

  const referendumsQuery = useReferendums();
  const loadingToasts = toasts.filter((toast) => toast.variant === "progress")
  const isLoading = !!loadingToasts.length || referendumsQuery.isLoading;

  const hasReferendum = !!referendumsQuery.data?.length

  return (
    <InfoTooltip
      text={
        isLoading
          ? t("header.notification.pending.tooltip", {
            number: loadingToasts.length,
          })
          : t("header.notification.tooltip")
      }
      type={isLoading ? "default" : "black"}
    >
      <div css={{ position: "relative" }}>
        {isLoading && <Spinner width={40} height={40} />}
        <SWrap>
          <SBellIcon
            onClick={() => setSidebar(true)}
            aria-label={t("toast.sidebar.title")}
            css={
              isLoading && {
                position: "absolute",
              }
            }
          />
          {hasReferendum && <SActiveReferendumIcon />}
        </SWrap>
      </div>
    </InfoTooltip>
  )
}
