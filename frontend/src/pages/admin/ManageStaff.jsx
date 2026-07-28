import { useEffect, useState } from 'react';
import api from '../../api/client';
import DashboardLayout from '../../components/DashboardLayout';
import FormField, { inputClass } from '../../components/FormField';

const emptyForm = { name: '', email: '', password: '', role: 'teacher', classesTaught: '' };

const roleLabels = { teacher: 'Teacher', parent: 'Parent' };

const ManageStaff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  const loadUsers = async () => {
    try {
      const [teachersRes, parentsRes] = await Promise.all([
        api.get('/auth/users', { params: { role: 'teacher' } }),
        api.get('/auth/users', { params: { role: 'parent' } }),
      ]);
      setUsers([...teachersRes.data, ...parentsRes.data]);
    } catch (err) {
      setError('Could not load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === 'teacher' && form.classesTaught) {
        payload.classesTaught = form.classesTaught.split(',').map((c) => c.trim());
      }
      await api.post('/auth/register', payload);
      setSuccess(`${form.name} added as ${roleLabels[form.role]}.`);
      setForm(emptyForm);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Staff & Parents">
        <p className="text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Staff & Parents">
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
        <h2 className="font-semibold text-slate-900 mb-4">Add New Account</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="Temporary Password">
            <input
              required
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          <FormField label="Role">
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </FormField>
          {form.role === 'teacher' && (
            <div className="sm:col-span-2">
              <FormField label="Classes Taught (comma-separated)">
                <input
                  className={inputClass}
                  placeholder="JSS 1, JSS 2"
                  value={form.classesTaught}
                  onChange={(e) => setForm({ ...form, classesTaught: e.target.value })}
                />
              </FormField>
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">All Staff & Parent Accounts</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-5 py-2 font-medium">Name</th>
              <th className="px-5 py-2 font-medium">Email</th>
              <th className="px-5 py-2 font-medium">Role</th>
              <th className="px-5 py-2 font-medium">Classes</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3">{u.name}</td>
                <td className="px-5 py-3 text-slate-500">{u.email}</td>
                <td className="px-5 py-3 capitalize">{u.role}</td>
                <td className="px-5 py-3 text-slate-500">
                  {u.classesTaught?.length ? u.classesTaught.join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ManageStaff;