import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import FormField, { inputClass } from '../../components/FormField';

const today = () => new Date().toISOString().slice(0, 10);

const ManageAttendance = () => {
  const [className, setClassName] = useState('JSS 1');
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [existingRecords, setExistingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async (cls, d) => {
    setLoading(true);
    setError('');
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get('/students', { params: { className: cls } }),
        api.get(`/attendance/class/${cls}`, { params: { date: d } }),
      ]);
      setStudents(studentsRes.data);
      setExistingRecords(attendanceRes.data);

      // Pre-fill status map: existing records win, default to 'present' otherwise
      const map = {};
      studentsRes.data.forEach((s) => {
        const existing = attendanceRes.data.find((a) => a.student?._id === s._id);
        map[s._id] = existing ? existing.status : 'present';
      });
      setStatusMap(map);
    } catch (err) {
      setError('Could not load class roster or attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(className, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClassOrDateChange = (nextClass, nextDate) => {
    setClassName(nextClass);
    setDate(nextDate);
    loadData(nextClass, nextDate);
  };

  const setStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const records = students.map((s) => ({ student: s._id, status: statusMap[s._id] || 'present' }));
      await api.post('/attendance/bulk', { className, date, records });
      setSuccess(`Attendance saved for ${records.length} students on ${date}.`);
      loadData(className, date);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const alreadyMarkedCount = existingRecords.length;

  return (
    <DashboardLayout title="Mark Attendance">
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

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <FormField label="Class">
          <input
            className={inputClass}
            value={className}
            onChange={(e) => handleClassOrDateChange(e.target.value, date)}
          />
        </FormField>
        <FormField label="Date">
          <input
            type="date"
            className={inputClass}
            value={date}
            onChange={(e) => handleClassOrDateChange(className, e.target.value)}
          />
        </FormField>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            {className} — {date}
          </h2>
          {alreadyMarkedCount > 0 && (
            <span className="text-sm text-slate-500">
              {alreadyMarkedCount} of {students.length} already marked
            </span>
          )}
        </div>

        {loading ? (
          <p className="px-5 py-6 text-sm text-slate-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">No students found in this class.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-2 font-medium">Student</th>
                  <th className="px-5 py-2 font-medium">Admission No.</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">{s.firstName} {s.lastName}</td>
                    <td className="px-5 py-3 text-slate-500">{s.admissionNumber}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatus(s._id, status)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              statusMap[s._id] === status
                                ? status === 'present'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : status === 'late'
                                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                                  : 'bg-red-50 border-red-300 text-red-700'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageAttendance;