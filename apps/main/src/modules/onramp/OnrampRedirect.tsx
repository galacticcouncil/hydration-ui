import { useNavigate } from "@tanstack/react-router"
import { FC, useEffect } from "react"

import {
  OnrampModalType,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"

type OnrampRedirectProps = { modal: OnrampModalType }

export const OnrampRedirect: FC<OnrampRedirectProps> = ({ modal }) => {
  const navigate = useNavigate()
  const setModal = useOnrampModal((state) => state.setModal)
  const openOnchain = useOnrampModal((state) => state.openOnchain)

  useEffect(() => {
    void navigate({ to: "/portfolio", replace: true }).then(() => {
      if (modal === "depositOnchain") openOnchain("current")
      else if (modal === "depositOnchainPreview") openOnchain("preview")
      else setModal(modal)
    })
  }, [modal, navigate, setModal, openOnchain])

  return null
}
