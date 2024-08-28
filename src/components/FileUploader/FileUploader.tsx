import { asUploadButton } from "@rpldy/upload-button"
import UploadDropZone from "@rpldy/upload-drop-zone"
import UploadPreview, { PreviewMethods } from "@rpldy/upload-preview"
import Uploady, { BatchItem, UPLOADER_EVENTS, useUploady } from "@rpldy/uploady"
import { Text } from "components/Typography/Text/Text"
import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
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
  parseDimensions,
  useFileErrorMessage,
} from "./FileUploader.utils"

export type FileUploaderProps = {
  placeholder?: string
  minDimensions?: string
  maxDimensions?: string
  maxSize?: number
  allowedTypes?: readonly FileType[]
}

const UploadButton = asUploadButton(
  forwardRef<HTMLDivElement>((props, ref) => {
    return <SUploadButton {...props} tabIndex={0} role="button" ref={ref} />
  }),
)

type UploaderWrapperProps = Partial<FileUploaderProps> & {
  file: BatchItem | null
  error?: string
  onFileAdded?: (item: BatchItem) => void
  onFileRemoved?: () => void
  previewMethodsRef: React.MutableRefObject<PreviewMethods | null>
}

const UploaderWrapper: React.FC<UploaderWrapperProps> = ({
  placeholder,
  error,
  file,
  allowedTypes,
  onFileAdded,
  onFileRemoved,
  previewMethodsRef,
}) => {
  const uploady = useUploady()

  useEffect(() => {
    const handleItemStart = (item: BatchItem) => onFileAdded?.(item)
    uploady.on(UPLOADER_EVENTS.ITEM_START, handleItemStart)
    return () => {
      uploady.off(UPLOADER_EVENTS.ITEM_START, handleItemStart)
    }
  }, [onFileAdded, uploady])

  function clearPreview() {
    previewMethodsRef.current?.clear()
    onFileRemoved?.()
  }

  const hasFile = !!file

  return (
    <SContainer error={!!error}>
      <UploadDropZone onDragOverClassName="drag-over">
        <UploadButton>
          <>
            {!hasFile && (
              <>
                <Text fs={12} lh={16} color="basic400">
                  {placeholder}
                </Text>
                {!error && allowedTypes && (
                  <Text fs={12} lh={16} color="basic400">
                    ({allowedTypes.join(", ")})
                  </Text>
                )}
              </>
            )}
            {error && (
              <Text fs={12} lh={16} color="red400">
                {error}
              </Text>
            )}
          </>
        </UploadButton>
        <SUploadPreview>
          <UploadPreview previewMethodsRef={previewMethodsRef} />
          {hasFile && (
            <SClearButton type="button" onClick={clearPreview}>
              x
            </SClearButton>
          )}
        </SUploadPreview>
      </UploadDropZone>
    </SContainer>
  )
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  placeholder,
  minDimensions = `${DEFAULT_MIN_WIDTH}x${DEFAULT_MIN_HEIGHT}`,
  maxDimensions = `${DEFAULT_MAX_WIDTH}x${DEFAULT_MAX_HEIGHT}`,
  maxSize = DEFAULT_MAX_SIZE,
  allowedTypes = ALL_FILE_TYPES,
}) => {
  const { t } = useTranslation()

  const [file, setFile] = useState<BatchItem | null>(null)
  const [errorCode, setErrorCode] = useState<FileError | null>(null)
  const previewMethodsRef = useRef<PreviewMethods>(null)

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
        setErrorCode(error.code)
        setFile(null)
        previewMethodsRef.current?.clear()
      },
    })
  }, [allowedTypes, maxHeight, maxSize, maxWidth, minHeight, minWidth])

  const error = useFileErrorMessage(errorCode, {
    maxSize,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    allowedTypes,
  })

  return (
    <Uploady fileFilter={fileFilter}>
      <UploaderWrapper
        file={file}
        placeholder={placeholder ?? t("fileUploader.placeholder")}
        allowedTypes={allowedTypes}
        error={error}
        onFileAdded={(file) => {
          setFile(file)
          setErrorCode(null)
        }}
        onFileRemoved={() => setFile(null)}
        previewMethodsRef={previewMethodsRef}
      />
    </Uploady>
  )
}
