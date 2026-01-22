import { Save } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonTransparent,
  Flex,
  FormError,
  Icon,
  Input,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useRef } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useClickAway } from "react-use"
import { z } from "zod/v4"

import { required } from "@/utils/validators"

const editFormSchema = z.object({
  name: required,
})

type EditFormValues = z.infer<typeof editFormSchema>

export type ListItemEditFormProps = {
  name: string
  onClose: () => void
  onSubmit: (name: string) => void
}

export const ListItemEditForm: React.FC<ListItemEditFormProps> = ({
  name,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<EditFormValues>({
    defaultValues: { name },
    mode: "onChange",
    resolver: standardSchemaResolver(editFormSchema),
  })

  useClickAway(formRef, () => onClose())

  const handleSubmit = (values: EditFormValues) => {
    onSubmit(values.name.trim())
    onClose()
  }

  return (
    <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)}>
      <Flex align="center" justify="space-between">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                variant="embedded"
                sx={{ px: 0, fontSize: 16, fontWeight: 400 }}
                autoFocus
              />
              {fieldState.error && (
                <FormError sx={{ position: "absolute", bottom: 0 }}>
                  {fieldState.error.message}
                </FormError>
              )}
            </>
          )}
        />
        <Flex
          align="center"
          justify="end"
          gap={12}
          color={getToken("text.medium")}
        >
          <ButtonTransparent
            type="submit"
            sx={{ lineHeight: 1, color: getToken("text.tint.primary"), gap: 8 }}
          >
            {t("save")}
            <Icon size={16} component={Save} />
          </ButtonTransparent>
        </Flex>
      </Flex>
    </form>
  )
}
