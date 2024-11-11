export type ToastVariant =
  | "info"
  | "success"
  | "error"
  | "progress"
  | "unknown"
  | "temporary"

export type CustomToastProps = {
  variant?: ToastVariant
}
