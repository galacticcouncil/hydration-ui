import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { positive, required, validateMaxBalance } from "@/utils/validators"

export type BorrowHollarFormValues = z.infer<ReturnType<typeof useSchema>>

type UseBorrowHollarFormParams = {
  maxBorrowable: string
}

const useSchema = (maxBorrowable: string) => {
  const { t } = useTranslation(["strategies"])

  return z.object({
    amount: required.pipe(positive).check(
      refine<string>((value) => validateMaxBalance(maxBorrowable, value), {
        error: t("bil.borrow.cta.exceeds"),
      }),
    ),
  })
}

export const useBorrowHollarForm = ({
  maxBorrowable,
}: UseBorrowHollarFormParams) => {
  return useForm({
    defaultValues: {
      amount: "",
    },
    resolver: standardSchemaResolver(useSchema(maxBorrowable)),
    mode: "onChange",
  })
}
