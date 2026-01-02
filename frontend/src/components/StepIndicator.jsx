const StepIndicator = ({ steps = [], current = 0 }) => {
  return (
    <ol className="flex items-center gap-3 text-sm" aria-label="Progress">
      {steps.map((label, index) => {
        const isActive = index === current
        const isDone = index < current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                isDone ? 'bg-green-600 text-white border-green-600' : isActive ? 'border-green-600 text-green-800' : 'border-gray-300 text-gray-500'
              }`}
            >
              {index + 1}
            </span>
            <span className={isActive ? 'text-green-900 font-semibold' : 'text-gray-600'}>{label}</span>
            {index !== steps.length - 1 && <span className="h-px w-8 bg-gray-200" aria-hidden="true" />}
          </li>
        )
      })}
    </ol>
  )
}

export default StepIndicator
