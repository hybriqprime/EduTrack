import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import FormField, { inputClass } from '../../components/FormField';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const emptyForm = { className: 'JSS 1', day: 'Monday', period: '', subject: '', teacher: '' };

const ManageTimetable = () => {
  const [className, setClassName] = useState('JSS 1');
  const [entries, setEntries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadEntries = async (cls) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/timetable/class/${cls}`);
      setEntries(data);
    } catch (err) {
      setError('Could not load timetable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get('/auth/users', { params: { role: 'teacher' } });
        setTeachers(data);
      } catch (err) {
        // non-fatal — teacher assignment is optional
      }
      loadEntries(className);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClassChange = (cls) => {
    setClassName(cls);
    setForm((f) => ({ ...f, className: cls }));
    loadEntries(cls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      await api.post('/timetable', { ...form, className });
      setSuccess(`${form.subject} added for ${form.day}, ${form.period}.`);
      setForm({ ...emptyForm, className, day: form.day });
      loadEntries(className);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add timetable entry.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/timetable/${id}`);
      loadEntries(className);
    } catch (err) {
      setError('Could not remove entry.');
    }
  };

  return (
    <DashboardLayout title="Manage Timetable">
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

      <div className="mb-6 max-w-xs">
        <FormField label="Class">
          <input
            className={inputClass}
            value={className}
            onChange={(e) => handleClassChange(e.target.value)}
            placeholder="JSS 1"
          />
        </FormField>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add Timetable Entry</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Day">
            <select
              className={inputClass}
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Period">
            <input
              required
              className={inputClass}
              placeholder="8:00 - 8:45"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
            />
          </FormField>
          <FormField label="Subject">
            <input
              required
              className={inputClass}
              placeholder="Mathematics"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </FormField>
          <FormField label="Teacher">
            <select
              className={inputClass}
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </FormField>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
            >
              {creating ? 'Adding...' : 'Add to Timetable'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{className} Timetable</h2>
        </div>
        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No timetable entries yet for this class.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="px-5 py-2 font-medium">Day</th>
                <th className="px-5 py-2 font-medium">Period</th>
                <th className="px-5 py-2 font-medium">Subject</th>
                <th className="px-5 py-2 font-medium">Teacher</th>
                <th className="px-5 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">{entry.day}</td>
                  <td className="px-5 py-3 text-slate-500">{entry.period}</td>
                  <td className="px-5 py-3">{entry.subject}</td>
                  <td className="px-5 py-3 text-slate-500">{entry.teacher?.name || '—'}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(entry._id)}
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

export default ManageTimetable;