import { useEffect, useRef } from "react"
import { FieldValues, UseFormReturn } from "react-hook-form"

export const useSaveFormOnChange = <TFormValues extends FieldValues>(
  form: UseFormReturn<TFormValues>,
  onSubmit: (value: TFormValues) => void,
) => {
  const { handleSubmit, watch } = form

  const onSubmitRef = useRef(handleSubmit(onSubmit))
  useEffect(() => {
    onSubmitRef.current = handleSubmit(onSubmit)
  }, [handleSubmit, onSubmit])

  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type === "change") {
        onSubmitRef.current()
      }
    })

    return () => subscription.unsubscribe()
  }, [watch])
}
