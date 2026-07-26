import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';

const TERM = 'Second Term';
const SESSION = '2025/2026';
const CLASS_NAME = 'JSS 1';

const TeacherDashboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/results/class/${CLASS_NAME}`, {
          params: { term: TERM, session: SESSION },
        });
        setResults(data);
      } catch (err) {
        setError('Could not load results. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const downloadPdf = async (resultId, studentName) => {
    try {
      const response = await api.get(`/results/${resultId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName.replace(/\s+/g, '-')}-result.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Could not generate PDF.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Teacher Dashboard">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Dashboard">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-100 mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">
            {CLASS_NAME} Results — {TERM}, {SESSION}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Ranked by class average</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-medium">Position</th>
              <th className="px-5 py-2 font-medium">Student</th>
              <th className="px-5 py-2 font-medium">Average</th>
              <th className="px-5 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-900">{r.position}</td>
                <td className="px-5 py-3">
                  {r.student?.firstName} {r.student?.lastName}
                  <span className="text-slate-400 ml-2 text-xs">{r.student?.admissionNumber}</span>
                </td>
                <td className="px-5 py-3">{r.average}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => downloadPdf(r._id, `${r.student?.firstName}-${r.student?.lastName}`)}
                    className="text-[#1e3a5f] hover:underline text-sm font-medium"
                  >
                    Download PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
