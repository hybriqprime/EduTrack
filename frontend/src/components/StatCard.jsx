const StatCard = ({ label, value, accent = 'default' }) => {
  const accentStyles = {
    default: 'text-slate-900',
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accentStyles[accent]}`}>{value}</div>
    </div>
  );
};

export default StatCard;
