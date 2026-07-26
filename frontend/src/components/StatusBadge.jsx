const styles = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.unpaid}`}
  >
    {status}
  </span>
);

export default StatusBadge;
