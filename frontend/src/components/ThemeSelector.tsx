import { themes, useTheme } from '../theme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed right-4 top-4 z-40">
      <label className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-xs text-white/85 backdrop-blur-xl shadow-lg shadow-black/10">
        <span className="whitespace-nowrap font-medium uppercase tracking-[0.16em] text-white/60">
          Theme
        </span>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as typeof theme)}
          className="bg-transparent text-sm text-white outline-none"
          aria-label="Theme selector"
        >
          {themes.map((item) => (
            <option key={item.name} value={item.name} className="text-slate-900">
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
