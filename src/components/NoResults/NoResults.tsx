import NoResultsIcon from "assets/icons/NoResults.svg?react"
import { Text } from "components/Typography/Text/Text"
import { FC, HTMLAttributes } from "react"
import { Trans, useTranslation } from "react-i18next"

export const NoResults: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "column", align: "center", gap: 10 }} {...props}>
      <NoResultsIcon />
      <Text fs={16} color="alpha0" font="FontOver">
        {t("results.notfound.title")}
      </Text>
      <Text fs={14} color="darkBlue100">
        <Trans
          t={t}
          i18nKey="results.notfound.description"
          components={{
            telegram: (
              <a
                sx={{ color: "brightBlue100" }}
                css={{ textDecoration: "underline" }}
                href="https://t.me/hydradx"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            ),
          }}
        />
      </Text>
    </div>
  )
}
