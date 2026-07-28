import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

const TERM = 'Second Term';
const SESSION = '2025/2026';
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: me } = await api.get('/students/my-profile');
        setProfile(me);

        const [timetableRes, examsRes, resultsRes, feesRes, attendanceRes] = await Promise.all([
          api.get('/timetable/my-schedule'),
          api.get('/exams/my-schedule', { params: { term: TERM, session: SESSION } }),
          api.get(`/results/student/${me._id}`),
          api.get(`/fees/student/${me._id}`),
          api.get(`/attendance/student/${me._id}`),
        ]);

        setTimetable(timetableRes.data);
        setExams(examsRes.data);
        setResults(resultsRes.data);
        setFees(feesRes.data);
        setAttendance(attendanceRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your dashboard. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const downloadPdf = async (resultId) => {
    try {
      const response = await api.get(`/results/${resultId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-result.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Could not generate PDF.');
    }
  };

  const timetableByDay = DAY_ORDER.map((day) => ({
    day,
    entries: timetable.filter((t) => t.day === day).sort((a, b) => a.period.localeCompare(b.period)),
  }));

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const attendanceRate =
    attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  if (loading) {
    return (
      <DashboardLayout title="Student Dashboard">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Dashboard">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-100 mb-6">
          {error}
        </div>
      )}

      {profile && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="text-sm text-slate-500">
            {profile.className} · {profile.admissionNumber}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Latest Average"
          value={results[0] ? results[0].average : '—'}
          accent="good"
        />
        <StatCard
          label="Attendance Rate"
          value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
          accent={attendanceRate !== null && attendanceRate < 80 ? 'warn' : 'good'}
        />
        <StatCard
          label="Upcoming Exams"
          value={exams.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timetable */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Weekly Timetable</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {timetableByDay.map(({ day, entries }) => (
              <div key={day} className="px-5 py-3">
                <div className="text-sm font-medium text-slate-700 mb-1">{day}</div>
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-400">No classes scheduled.</p>
                ) : (
                  <ul className="space-y-1">
                    {entries.map((entry) => (
                      <li key={entry._id} className="text-sm flex justify-between text-slate-600">
                        <span>{entry.period}</span>
                        <span>{entry.subject}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exam Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Exam Schedule</h2>
            <p className="text-sm text-slate-500 mt-0.5">{TERM}, {SESSION}</p>
          </div>
          {exams.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No exams scheduled yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {exams.map((exam) => (
                <li key={exam._id} className="px-5 py-3 flex justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{exam.subject}</div>
                    <div className="text-slate-500 text-xs">
                      {exam.venue} · {exam.durationMinutes} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-700">
                      {new Date(exam.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <div className="text-slate-500 text-xs">{exam.startTime}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">My Results</h2>
          </div>
          {results.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">No results published yet.</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {results.map((r) => (
                <li key={r._id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{r.term}, {r.session}</div>
                    <div className="text-slate-500 text-xs">Average: {r.average}</div>
                  </div>
                  <button
                    onClick={() => downloadPdf(r._id)}
                    className="text-[#1e3a5f] hover:underline text-sm font-medium"
                  >
                    Download PDF
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fees & Attendance */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Fees & Attendance</h2>
          </div>
          <div className="px-5 py-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Fee Status</h3>
            {fees.length === 0 ? (
              <p className="text-sm text-slate-400">No fee records yet.</p>
            ) : (
              <ul className="space-y-2 mb-4">
                {fees.map((f) => (
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

            <h3 className="text-sm font-medium text-slate-700 mb-2 mt-4">Recent Attendance</h3>
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-400">No attendance recorded yet.</p>
            ) : (
              <ul className="space-y-1">
                {attendance.slice(0, 5).map((a) => (
                  <li key={a._id} className="text-sm flex justify-between text-slate-600">
                    <span>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span
                      className={
                        a.status === 'present'
                          ? 'text-emerald-600'
                          : a.status === 'late'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }
                    >
                      {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;