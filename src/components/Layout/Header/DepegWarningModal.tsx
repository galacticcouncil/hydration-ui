import { theme } from "theme"
import { css } from "@emotion/react"
import { Text } from "components/Typography/Text/Text"
import { ExternalLink } from "components/Link/ExternalLink"
import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import create from "zustand"
import { persist } from "zustand/middleware"
import { useTranslation } from "react-i18next"

export const DepegWarningModal = (props: { onClose: () => void }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("depeg.modal.title")}
        width={460}
      >
        <Text css={{ color: "#B2B6C5" }} lh={24} sx={{ mt: 16 }}>
          {t("depeg.modal.description")}
        </Text>

        <div sx={{ flex: "row", justify: "space-between", mt: 32 }}>
          <ExternalLink
            href="https://www.coingecko.com/en/coins/dai"
            css={{ color: "#85D1FF" }}
          >
            {t("depeg.modal.more.info")}
          </ExternalLink>
          <ExternalLink
            sx={{ color: "pink600" }}
            href="https://www.coingecko.com/en/coins/dai"
          >
            {t("depeg.modal.check.price")}
          </ExternalLink>
        </div>
      </Modal>
      <div
        css={css`
          background: linear-gradient(90deg, #ff1f7a 41.09%, #57b3eb 100%);

          width: 100%;
          position: fixed;
          bottom: 60px;
          left: 0;
          right: 0;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 16px;
          z-index: ${theme.zIndices.header};

          color: ${theme.colors.white};

          @media ${theme.viewport.gte.sm} {
            bottom: 0;
          }

          @media ${theme.viewport.gte.md} {
            top: 0;
            height: 40px;
            bottom: unset;
            padding: 0 8px;
          }
        `}
        onClick={() => setOpen(true)}
      >
        <div css={{ display: "flex", flex: "1 1 0%", flexBasis: 0 }}></div>
        <div
          css={css`
            display: flex;
            flex-direction: row;

            gap: 8px;
            align-items: center;
            justify-content: center;
          `}
        >
          <svg
            width="18"
            height="15"
            viewBox="0 0 18 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            css={{ flexShrink: 0 }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.75753 0.707031L16.7104 14.4818H0.804688L8.75753 0.707031ZM8.01068 10.5323H9.50752V12.0291H8.01068V10.5323ZM9.50752 5.99067H8.01068V9.48331H9.50752V5.99067Z"
              fill="url(#paint0_linear_21027_167880)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_21027_167880"
                x1="8.75753"
                y1="1.38726"
                x2="8.75753"
                y2="14.4818"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.448929" stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0.27" />
              </linearGradient>
            </defs>
          </svg>

          <Text>{t("depeg.modal.description")}</Text>
          <ExternalLink
            href="https://www.coingecko.com/en/coins/dai"
            css={{ whiteSpace: "nowrap" }}
            onClick={(e) => e.stopPropagation()}
          >
            {t("depeg.modal.more.info")}
          </ExternalLink>
        </div>

        <div
          css={{
            display: "flex",
            flex: "1 1 0%",
            flexBasis: 0,
            justifyContent: "flex-end",
          }}
        >
          <CrossIcon
            onClick={(e) => {
              e.stopPropagation()
              props.onClose()
            }}
          />
        </div>
      </div>
    </>
  )
}
export const useDepegStore = create(
  persist<{
    depegOpen: boolean
    setDepegOpen: (rpcUrl: boolean | undefined) => void
  }>(
    (set) => ({
      depegOpen: true,
      setDepegOpen: (depegOpen) => set({ depegOpen }),
    }),
    {
      name: "depegWarning",
      getStorage: () => window.sessionStorage,
    },
  ),
)
