interface StatCardProps {
  label: string;
  value: string | number;
}

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div className="flex min-w-[120px] flex-col items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:bg-white/15">
      <div className="text-2xl leading-none font-bold text-white tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
        {label}
      </div>
    </div>
  );
};
