import { FormEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { SButton, SContainer, SInput } from "./ProviderItemEdit.styled"
import { ReactComponent as IconEnter } from "assets/icons/IconEnter.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useRpcStore } from "state/store"
import { useClickAway } from "react-use"

type ProviderItemEditProps = {
  name: string
  url: string
  onCancle: () => void
}

export const ProviderItemEdit = ({
  name,
  url,
  onCancle,
}: ProviderItemEditProps) => {
  const { t } = useTranslation()
  const [input, setInput] = useState(name)
  const { renameRpc } = useRpcStore()

  const ref = useRef(null)

  useClickAway(ref, () => onCancle())

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input) return
    renameRpc(url, input)
    onCancle()
  }

  return (
    <SContainer onSubmit={onSubmit} ref={ref}>
      <SInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <div sx={{ flex: "row", gap: 20 }}>
        <Text fs={14} color="basic600">
          {new URL(url).hostname}
        </Text>
        {!!input && (
          <SButton type="submit">
            {t("save")}
            <Icon icon={<IconEnter />} />
          </SButton>
        )}
      </div>
    </SContainer>
  )
}
