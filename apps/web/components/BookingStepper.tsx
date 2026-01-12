const defaultSteps = ['Requested', 'Accepted', 'In Progress', 'Completed'];

type Props = {
  current: number; // 0-based index
  steps?: string[];
};

export default function BookingStepper({ current, steps }: Props) {
  const labels = steps && steps.length ? steps : defaultSteps;
  return (
    <div className="flex items-center justify-between gap-2">
      {labels.map((label, idx) => {
        const active = idx <= current;
        return (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${active ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600'}`}>
              {idx + 1}
            </div>
            <div className="text-xs text-gray-700">{label}</div>
            {idx < labels.length - 1 && <div className={`flex-1 h-[2px] ${active ? 'bg-brand' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}
