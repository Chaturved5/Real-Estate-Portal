const GuardedAction = ({ allowed = true, reason, children }) => {
  if (allowed) return children
  return (
    <div className="relative group inline-block">
      <div className="pointer-events-none opacity-70">{children}</div>
      {reason && (
        <div className="absolute z-10 mt-2 hidden min-w-[200px] rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 shadow group-hover:block">
          {reason}
        </div>
      )}
    </div>
  )
}

export default GuardedAction
