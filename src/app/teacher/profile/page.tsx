'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Mail, Shield, Calendar, Building2, LogOut, Loader2 } from 'lucide-react';
import { getBackendUrl } from '@/lib/backend-url';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  school: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const backendUrl = getBackendUrl();
        const res = await fetch(`${backendUrl}/api/teacher/profile`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);

    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/teacher/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderColor: '#0A66C2', borderBottomColor: '#0A66C2', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderWidth: '2px' }}></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em]" style={{ color: '#0A66C2' }}>
          Teacher account
        </p>
        <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
        <p className="text-gray-600 mt-1">Manage your profile and account settings</p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Header with gradient background */}
        <div className="h-24 sm:h-32" style={{ backgroundColor: '#0A66C220' }}></div>

        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 relative z-10">
            <div className="flex items-end gap-4 mb-6 sm:mb-0">
              <div
                className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                style={{ backgroundColor: '#0A66C220' }}
              >
                <span className="text-2xl sm:text-4xl font-bold" style={{ color: '#0A66C2' }}>
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="pb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-600">{profile.role}</p>
              </div>
            </div>

            {/* School Badge */}
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">School</p>
              <p className="text-sm font-semibold text-gray-900">{profile.school.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: '#0A66C220' }}>
              <Mail className="h-6 w-6" style={{ color: '#0A66C2' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Email Address</p>
              <p className="text-sm font-semibold text-gray-900 break-all">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* Role Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: '#0A66C220' }}>
              <Shield className="h-6 w-6" style={{ color: '#0A66C2' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Role</p>
              <p className="text-sm font-semibold text-gray-900">{profile.role}</p>
            </div>
          </div>
        </div>

        {/* Joined Date Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: '#0A66C220' }}>
              <Calendar className="h-6 w-6" style={{ color: '#0A66C2' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Joined</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* School Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: '#0A66C220' }}>
              <Building2 className="h-6 w-6" style={{ color: '#0A66C2' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600 font-medium mb-1">Institution</p>
              <p className="text-sm font-semibold text-gray-900">{profile.school.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all border border-gray-200 text-gray-900 hover:border-gray-300 hover:shadow-sm text-left"
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-600 mt-1">Update your account password</p>
              </div>
            </div>
          </button>

          <button
            className="w-full px-6 py-3 rounded-lg font-medium transition-all text-left border"
            style={{ borderColor: '#FF4444', color: '#FF4444', backgroundColor: '#FF444410' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF444420'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF444410'}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5" />
              <div className="flex-1">
                <p className="font-medium">Sign Out</p>
                <p className="text-xs mt-1">Log out from your teacher account</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="text-gray-600 hover:text-gray-900 transition text-xl leading-none"
              >
                ×
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-800">{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#0A66C2' }}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
