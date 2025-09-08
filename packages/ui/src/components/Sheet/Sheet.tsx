import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { FC, Ref } from "react"

import { FlexProps } from "@/components/Flex"

import {
  SSheetBody,
  SSheetClose,
  SSheetContent,
  SSheetHeader,
  SSheetOverlay,
  SSheetPaper,
  SSheetTitle,
  SSheetWrapper,
} from "./Sheet.styled"

const SheetRoot = DialogPrimitive.Root

const SheetTrigger = DialogPrimitive.Trigger

const SheetPortal = DialogPrimitive.Portal

const SheetClose = DialogPrimitive.Close

const SheetOverlay: FC<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    ref?: Ref<React.ElementRef<typeof DialogPrimitive.Overlay>>
  }
> = ({ ref, ...props }) => <SSheetOverlay ref={ref} {...props} />

const SheetContent: FC<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    ref?: Ref<React.ElementRef<typeof DialogPrimitive.Content>>
  }
> = ({ children, ref, ...props }) => (
  <SheetPortal>
    <SheetOverlay />
    <SSheetWrapper>
      <SSheetContent ref={ref} {...props}>
        <SSheetPaper>{children}</SSheetPaper>
      </SSheetContent>
    </SSheetWrapper>
  </SheetPortal>
)

const SheetTitle: FC<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    ref?: Ref<React.ElementRef<typeof DialogPrimitive.Title>>
  }
> = ({ children, ref, ...props }) => (
  <DialogPrimitive.Title ref={ref} asChild {...props}>
    <SSheetTitle as="h2">{children}</SSheetTitle>
  </DialogPrimitive.Title>
)

type SheetHeaderProps = Omit<FlexProps, "title"> & {
  title?: string
}

const SheetHeader: FC<SheetHeaderProps> = ({ title, ...props }) => (
  <SSheetHeader {...props}>
    <SheetTitle>{title || <>&nbsp;</>}</SheetTitle>
    <SSheetClose>
      <X sx={{ width: 20, height: 20 }} />
    </SSheetClose>
  </SSheetHeader>
)

const SheetBody = (props: FlexProps) => <SSheetBody {...props} />

export type SheetProps = React.ComponentProps<typeof SheetRoot> & {
  title?: string
  disableInteractOutside?: boolean
}

const Sheet = ({
  title,
  disableInteractOutside = false,
  children,
  ...props
}: SheetProps) => {
  return (
    <SheetRoot {...props}>
      <SheetContent
        onInteractOutside={
          disableInteractOutside ? (e) => e.preventDefault() : undefined
        }
      >
        <SheetHeader title={title} />
        <SheetBody>{children}</SheetBody>
      </SheetContent>
    </SheetRoot>
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetRoot,
  SheetTitle,
  SheetTrigger,
}
