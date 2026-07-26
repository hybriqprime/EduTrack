import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

const TERM = 'Second Term';
const SESSION = '2025/2026';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, feesRes] = await Promise.all([
          api.get('/students'),
          api.get('/fees', { params: { term: TERM, session: SESSION } }),
        ]);
        setStudents(studentsRes.data);
        setFees(feesRes.data);
      } catch (err) {
        setError('Could not load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const defaulters = fees.filter((f) => f.status !== 'paid');
  const totalCollected = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const totalExpected = fees.reduce((sum, f) => sum + f.amountDue, 0);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-100 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Students" value={students.length} />
        <StatCard
          label="Fees Collected (this term)"
          value={`₦${totalCollected.toLocaleString()}`}
          accent="good"
        />
        <StatCard
          label="Outstanding"
          value={`₦${(totalExpected - totalCollected).toLocaleString()}`}
          accent={totalExpected - totalCollected > 0 ? 'bad' : 'good'}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Fee Defaulters — {TERM}, {SESSION}
          </h2>
          <span className="text-sm text-slate-500">{defaulters.length} of {fees.length} students</span>
        </div>

        {defaulters.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-500">
            No defaulters this term — everyone's paid up.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-5 py-2 font-medium">Student</th>
                <th className="px-5 py-2 font-medium">Class</th>
                <th className="px-5 py-2 font-medium">Amount Due</th>
                <th className="px-5 py-2 font-medium">Amount Paid</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {defaulters.map((f) => (
                <tr key={f._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    {f.student?.firstName} {f.student?.lastName}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{f.student?.className}</td>
                  <td className="px-5 py-3">₦{f.amountDue.toLocaleString()}</td>
                  <td className="px-5 py-3">₦{f.amountPaid.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Students</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Admission No.</th>
              <th className="px-5 py-2 font-medium">Class</th>
              <th className="px-5 py-2 font-medium">Parent</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3">{s.firstName} {s.lastName}</td>
                <td className="px-5 py-3 text-slate-500">{s.admissionNumber}</td>
                <td className="px-5 py-3">{s.className}</td>
                <td className="px-5 py-3 text-slate-500">{s.parent?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
