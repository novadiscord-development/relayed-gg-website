export default function AuthInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-slate-500 focus:border-violet-400 focus:bg-white/[0.06]"
      />
    </div>
  );
}