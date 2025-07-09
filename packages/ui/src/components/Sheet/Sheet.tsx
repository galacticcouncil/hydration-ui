import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { FC, forwardRef } from "react"

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

const SheetOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((props, ref) => <SSheetOverlay ref={ref} {...props} />)
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const SheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SSheetWrapper>
      <SSheetContent ref={ref} {...props}>
        <SSheetPaper>{children}</SSheetPaper>
      </SSheetContent>
    </SSheetWrapper>
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} asChild {...props}>
    <SSheetTitle as="h2">{children}</SSheetTitle>
  </DialogPrimitive.Title>
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

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
SheetHeader.displayName = "SheetHeader"

const SheetBody = (props: FlexProps) => <SSheetBody {...props} />
SheetBody.displayName = "SheetBody"

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
