import { createFileRoute } from "@tanstack/react-router"
import * as z from "zod/v4"

import { MultisigDetailPage } from "@/modules/multisig/MultisigDetailPage"

const searchSchema = z.object({
  address: z.string().optional(),
  page: z.number().optional(),
})

export const Route = createFileRoute("/multisigs/")({
  component: MultisigDetailPage,
  validateSearch: searchSchema,
})
