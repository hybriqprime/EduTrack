import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [resultsByChild, setResultsByChild] = useState({});
  const [feesByChild, setFeesByChild] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: kids } = await api.get('/students/my-children');
        setChildren(kids);

        const resultsMap = {};
        const feesMap = {};
        await Promise.all(
          kids.map(async (child) => {
            const [resultsRes, feesRes] = await Promise.all([
              api.get(`/results/student/${child._id}`),
              api.get(`/fees/student/${child._id}`),
            ]);
            resultsMap[child._id] = resultsRes.data;
            feesMap[child._id] = feesRes.data;
          })
        );
        setResultsByChild(resultsMap);
        setFeesByChild(feesMap);
      } catch (err) {
        setError('Could not load your child\'s records. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Parent Dashboard">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Parent Dashboard">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-100 mb-6">
          {error}
        </div>
      )}

      {children.length === 0 && !error && (
        <p className="text-slate-500">No children linked to your account yet.</p>
      )}

      <div className="space-y-6">
        {children.map((child) => (
          <div key={child._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">
                {child.firstName} {child.lastName}
              </h2>
              <p className="text-sm text-slate-500">
                {child.className} · {child.admissionNumber}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="px-5 py-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Latest Results</h3>
                {(resultsByChild[child._id] || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No results yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {resultsByChild[child._id].map((r) => (
                      <li key={r._id} className="text-sm flex justify-between">
                        <span className="text-slate-600">{r.term}, {r.session}</span>
                        <span className="font-medium text-slate-900">Avg: {r.average}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="px-5 py-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Fee Status</h3>
                {(feesByChild[child._id] || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No fee records yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {feesByChild[child._id].map((f) => (
                      <li key={f._id} className="text-sm flex items-center justify-between">
                        <span className="text-slate-600">{f.term}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-slate-500">
                            ₦{f.amountPaid.toLocaleString()} / ₦{f.amountDue.toLocaleString()}
                          </span>
                          <StatusBadge status={f.status} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
