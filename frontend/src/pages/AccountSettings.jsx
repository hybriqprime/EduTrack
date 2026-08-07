import { useState } from 'react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import FormField, { inputClass } from '../components/FormField';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    currentPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.email !== user.email) payload.email = form.email;
      if (form.password) payload.password = form.password;
      if (payload.email || payload.password) payload.currentPassword = form.currentPassword;

      await api.put('/auth/me', payload);
      setSuccess('Account updated successfully.');
      setForm({ ...form, password: '', currentPassword: '' });

      if (payload.email) {
        const stored = JSON.parse(localStorage.getItem('edutrack_user'));
        localStorage.setItem('edutrack_user', JSON.stringify({ ...stored, name: form.name, email: form.email }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Account Settings">
      <div className="max-w-md">
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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <FormField label="Full Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="New Password (leave blank to keep current)">
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormField>
          <FormField label="Current Password (required to change email or password)">
            <input
              type="password"
              className={inputClass}
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </FormField>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2c5282] transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
