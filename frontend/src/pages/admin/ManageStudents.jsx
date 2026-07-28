import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import FormField, { inputClass } from '../../components/FormField';

const emptyStudentForm = {
  firstName: '',
  lastName: '',
  admissionNumber: '',
  className: '',
  gender: '',
  dateOfBirth: '',
};

const emptyLoginForm = { email: '', password: '' };

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [creatingStudent, setCreatingStudent] = useState(false);

  const [loginTargetId, setLoginTargetId] = useState(null);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [creatingLogin, setCreatingLogin] = useState(false);

  const loadStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (err) {
      setError('Could not load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingStudent(true);
    try {
      await api.post('/students', studentForm);
      setSuccess(`${studentForm.firstName} ${studentForm.lastName} added successfully.`);
      setStudentForm(emptyStudentForm);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create student.');
    } finally {
      setCreatingStudent(false);
    }
  };

  const openLoginForm = (studentId) => {
    setLoginTargetId(studentId);
    setLoginForm(emptyLoginForm);
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingLogin(true);
    try {
      const { data } = await api.post(`/students/${loginTargetId}/create-login`, loginForm);
      setSuccess(`Login created for ${data.name}: ${data.email}`);
      setLoginTargetId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create login.');
    } finally {
      setCreatingLogin(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Students">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Students">
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

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Add New Student</h2>
        <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name">
            <input
              required
              className={inputClass}
              value={studentForm.firstName}
              onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
            />
          </FormField>
          <FormField label="Last Name">
            <input
              required
              className={inputClass}
              value={studentForm.lastName}
              onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
            />
          </FormField>
          <FormField label="Admission Number">
            <input
              required
              className={inputClass}
              placeholder="DS/2026/005"
              value={studentForm.admissionNumber}
              onChange={(e) => setStudentForm({ ...studentForm, admissionNumber: e.target.value })}
            />
          </FormField>
          <FormField label="Class">
            <input
              required
              className={inputClass}
              placeholder="JSS 1"
              value={studentForm.className}
              onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
            />
          </FormField>
          <FormField label="Gender">
            <select
              className={inputClass}
              value={studentForm.gender}
              onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FormField>
          <FormField label="Date of Birth">
            <input
              type="date"
              className={inputClass}
              value={studentForm.dateOfBirth}
              onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
            />
          </FormField>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creatingStudent}
              className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
            >
              {creatingStudent ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
              <th className="px-5 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b border-slate-50 last:border-0 align-top">
                <td className="px-5 py-3">{s.firstName} {s.lastName}</td>
                <td className="px-5 py-3 text-slate-500">{s.admissionNumber}</td>
                <td className="px-5 py-3">{s.className}</td>
                <td className="px-5 py-3 text-slate-500">{s.parent?.name || '—'}</td>
                <td className="px-5 py-3">
                  {loginTargetId === s._id ? (
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-2 min-w-[220px]">
                      <input
                        type="email"
                        required
                        placeholder="Login email"
                        className={inputClass}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Password"
                        className={inputClass}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={creatingLogin}
                          className="bg-[#1e3a5f] text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
                        >
                          {creatingLogin ? 'Creating...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoginTargetId(null)}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => openLoginForm(s._id)}
                      className="text-[#1e3a5f] hover:underline text-sm font-medium whitespace-nowrap"
                    >
                      Create Login
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ManageStudents;