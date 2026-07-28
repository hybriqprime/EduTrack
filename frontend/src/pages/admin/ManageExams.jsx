import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import FormField, { inputClass } from '../../components/FormField';

const TERMS = ['First Term', 'Second Term', 'Third Term'];

const emptyForm = {
  className: 'JSS 1',
  subject: '',
  term: 'Second Term',
  session: '2025/2026',
  date: '',
  startTime: '',
  durationMinutes: 60,
  venue: '',
};

const ManageExams = () => {
  const [className, setClassName] = useState('JSS 1');
  const [term, setTerm] = useState('Second Term');
  const [session, setSession] = useState('2025/2026');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadExams = async (cls, t, s) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/exams/class/${cls}`, { params: { term: t, session: s } });
      setExams(data);
    } catch (err) {
      setError('Could not load exam schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams(className, term, session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (next) => {
    const updated = { className, term, session, ...next };
    setClassName(updated.className);
    setTerm(updated.term);
    setSession(updated.session);
    loadExams(updated.className, updated.term, updated.session);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await api.post('/exams', { ...form, className, term, session });
      setSuccess(`${form.subject} exam scheduled.`);
      setForm({ ...emptyForm, className, term, session });
      loadExams(className, term, session);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not schedule exam.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      loadExams(className, term, session);
    } catch (err) {
      setError('Could not remove exam.');
    }
  };

  return (
    <DashboardLayout title="Manage Exams">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-100 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-4 py-3 border border-emerald-100 mb-4">
          {success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <FormField label="Class">
          <input
            className={inputClass}
            value={className}
            onChange={(e) => handleFilterChange({ className: e.target.value })}
          />
        </FormField>
        <FormField label="Term">
          <select
            className={inputClass}
            value={term}
            onChange={(e) => handleFilterChange({ term: e.target.value })}
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Session">
          <input
            className={inputClass}
            value={session}
            onChange={(e) => handleFilterChange({ session: e.target.value })}
          />
        </FormField>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Schedule Exam</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Subject">
            <input
              required
              className={inputClass}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </FormField>
          <FormField label="Date">
            <input
              type="date"
              required
              className={inputClass}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </FormField>
          <FormField label="Start Time">
            <input
              className={inputClass}
              placeholder="9:00 AM"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </FormField>
          <FormField label="Duration (minutes)">
            <input
              type="number"
              className={inputClass}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Venue">
              <input
                className={inputClass}
                placeholder="Hall A"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
              />
            </FormField>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
            >
              {creating ? 'Scheduling...' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">
            {className} Exam Schedule — {term}, {session}
          </h2>
        </div>
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading...</p>
        ) : exams.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No exams scheduled yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-5 py-2 font-medium">Subject</th>
                <th className="px-5 py-2 font-medium">Date</th>
                <th className="px-5 py-2 font-medium">Time</th>
                <th className="px-5 py-2 font-medium">Venue</th>
                <th className="px-5 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">{exam.subject}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">{exam.startTime}</td>
                  <td className="px-5 py-3 text-slate-500">{exam.venue}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageExams;