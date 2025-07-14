import {
  isH160Address,
  isSS58Address,
  safeConvertAddressH160,
  safeConvertAddressSS58,
} from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { type infer as Infer, object, string } from "zod/v4"

export type ExternalWalletFormValues = Infer<typeof schema>

const validateAddress = string()
  .trim()
  .min(1, "Address is required")
  .refine(
    (value) =>
      isH160Address(safeConvertAddressH160(value)) ||
      isSS58Address(safeConvertAddressSS58(value)),
    "Invalid address format",
  )

const schema = object({
  address: validateAddress,
})

const defaultValues: ExternalWalletFormValues = {
  address: "",
}

export const useExternalWalletForm = () => {
  return useForm<ExternalWalletFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })
}
