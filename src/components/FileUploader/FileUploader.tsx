import { asUploadButton } from "@rpldy/upload-button"
import UploadDropZone from "@rpldy/upload-drop-zone"
import Uploady, { Batch, UPLOADER_EVENTS, useUploady } from "@rpldy/uploady"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { Text } from "components/Typography/Text/Text"
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  SClearButton,
  SContainer,
  SUploadButton,
  SUploadPreview,
} from "./FileUploader.styled"
import {
  ALL_FILE_TYPES,
  createFileFilter,
  DEFAULT_MAX_HEIGHT,
  DEFAULT_MAX_SIZE,
  DEFAULT_MAX_WIDTH,
  DEFAULT_MIN_HEIGHT,
  DEFAULT_MIN_WIDTH,
  FileError,
  FileType,
  isFile,
  parseDimensions,
  useFileErrorMessage,
} from "./FileUploader.utils"
import { usePrevious } from "react-use"
import { useTranslation } from "react-i18next"

export type FileUploaderProps = {
  label?: string
  hint?: string
  minDimensions?: string
  maxDimensions?: string
  maxSize?: number
  forceCircleImg?: boolean
  allowedTypes?: readonly FileType[]
  onChange?: (files: File[]) => void
}

export const FileUploaderProvider = Uploady

const UploadButton = asUploadButton(
  forwardRef<HTMLDivElement>((props, ref) => {
    return <SUploadButton {...props} tabIndex={0} role="button" ref={ref} />
  }),
)

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  hint,
  minDimensions = `${DEFAULT_MIN_WIDTH}x${DEFAULT_MIN_HEIGHT}`,
  maxDimensions = `${DEFAULT_MAX_WIDTH}x${DEFAULT_MAX_HEIGHT}`,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = ALL_FILE_TYPES,
  onChange,
  forceCircleImg = false,
}) => {
  const { t } = useTranslation()
  const { abortBatch, clearPending, ...uploady } = useUploady()

  const [batch, setBatch] = useState<Batch | null>(null)
  const [errorCode, setErrorCode] = useState<FileError | null>(null)
  const prevBatch = usePrevious(batch)

  const [minWidth, minHeight] = parseDimensions(minDimensions)
  const [maxWidth, maxHeight] = parseDimensions(maxDimensions)

  const fileFilter = useMemo(() => {
    return createFileFilter({
      maxSize,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      allowedTypes,
      onError: (error) => {
        if (batch) abortBatch(batch.id)
        setErrorCode(error.code)
      },
    })
  }, [
    abortBatch,
    allowedTypes,
    batch,
    maxHeight,
    maxSize,
    maxWidth,
    minHeight,
    minWidth,
  ])

  const onBatchAdded = useCallback(
    (batch: Batch) => {
      if (prevBatch) abortBatch(prevBatch.id)
      setBatch(batch)
      setErrorCode(null)

      const files = batch.items.map(({ file }) => file).filter(isFile)
      onChange?.(files)
    },
    [abortBatch, onChange, prevBatch],
  )

  const onBatchAborted = useCallback(() => {
    setBatch?.(null)
    onChange?.([])
  }, [onChange])

  useEffect(() => {
    uploady.on(UPLOADER_EVENTS.BATCH_ADD, onBatchAdded)
    uploady.on(UPLOADER_EVENTS.BATCH_ABORT, onBatchAborted)
    uploady.on(UPLOADER_EVENTS.BATCH_CANCEL, onBatchAborted)

    return () => {
      uploady.off(UPLOADER_EVENTS.BATCH_ADD, onBatchAdded)
      uploady.off(UPLOADER_EVENTS.BATCH_ABORT, onBatchAborted)
      uploady.off(UPLOADER_EVENTS.BATCH_CANCEL, onBatchAborted)
    }
  }, [onBatchAborted, onBatchAdded, uploady])

  const error = useFileErrorMessage(errorCode, {
    maxSize,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    allowedTypes,
  })

  const files = batch?.items
    ? batch.items.map(({ file }) => file).filter(isFile)
    : []

  return (
    <SContainer error={!!error}>
      <UploadDropZone onDragOverClassName="drag-over" fileFilter={fileFilter}>
        <UploadButton fileFilter={fileFilter}>
          <>
            {!batch && (
              <>
                <Text fs={12} lh={16} color="basic400" tAlign="center">
                  {label ?? t("fileUploader.label")}
                </Text>
                {!error && hint && (
                  <Text fs={12} lh={16} color="basic400" tAlign="center">
                    ({hint})
                  </Text>
                )}
              </>
            )}
            {error && (
              <Text fs={12} lh={16} color="red400" tAlign="center">
                {error}
              </Text>
            )}
          </>
        </UploadButton>
        <SUploadPreview sx={{ color: "white" }}>
          {files.map((file) => (
            <div css={forceCircleImg && { borderRadius: 9999 }}>
              <img alt="" src={URL.createObjectURL(file)} />
            </div>
          ))}
          {batch && (
            <SClearButton type="button" onClick={() => abortBatch(batch.id)}>
              <CrossIcon />
            </SClearButton>
          )}
        </SUploadPreview>
      </UploadDropZone>
    </SContainer>
  )
}
