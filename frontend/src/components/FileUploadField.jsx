import { useRef } from 'react'

const ACCEPTED = '.pdf,.png,.jpg,.jpeg'

const FileUploadField = ({ label, hint, multiple = true, files = [], onChange, maxFiles = 5, maxSizeMb = 5 }) => {
  const inputRef = useRef(null)

  const handleSelect = (event) => {
    const selected = Array.from(event.target.files || [])
    const filtered = selected.filter((file) => {
      const sizeMb = file.size / (1024 * 1024)
      return sizeMb <= maxSizeMb
    })

    const combined = [...files, ...filtered].slice(0, maxFiles)
    onChange?.(combined)
  }

  const removeAt = (index) => {
    const next = files.filter((_, idx) => idx !== index)
    onChange?.(next)
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-green-900">{label}</label>}
      <div className="border-2 border-dashed border-green-200 rounded-xl bg-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-gray-700">Upload files (PDF/JPG/PNG)</p>
            <p className="text-xs text-gray-500">Max {maxFiles} files, up to {maxSizeMb} MB each.</p>
            {hint && <p className="text-xs text-amber-700">{hint}</p>}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold shadow-sm hover:bg-green-700"
          >
            Choose files
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={ACCEPTED}
          className="hidden"
          onChange={handleSelect}
        />
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50">
                <div className="truncate">
                  <p className="font-semibold text-green-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="text-rose-600 text-xs font-semibold hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default FileUploadField
