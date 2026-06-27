'use client';

import React, { useState } from 'react';
import { roles } from './Roles';

interface RoleSelectionProps {
  staffId: string;
  onRoleSelected: (roleId: string, dutyIndex: number | null) => void;
  onCancel: () => void;
}

export default function RoleSelection({ staffId, onRoleSelected, onCancel }: RoleSelectionProps) {
  const [step, setStep] = useState<'select' | 'duties'>('select');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleClick = (roleId: string) => {
    setSelectedRoleId(roleId);
    setStep('duties');
  };

  const handleDutySelect = async (dutyIndex: number | null) => {
    if (!selectedRoleId) return;
    setLoading(true);
    setError('');
    try {
      // ✅ Use environment variable for API base URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiBase}/api/select-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId.trim(), // Trim to avoid any accidental whitespace
          role_id: selectedRoleId,
          duty_index: dutyIndex,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to assign role');
      }
      onRoleSelected(selectedRoleId, dutyIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-white mb-4">Role Selection</h2>
        {error && <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-2 rounded mb-4">{error}</div>}
        {step === 'select' ? (
          <div>
            <p className="text-zinc-300 mb-4">Please select your role from the options below:</p>
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <div className="text-white font-bold">{role.title}</div>
                      <div className="text-cyan-400 text-sm font-mono">{role.shortCode}</div>
                      <div className="text-zinc-400 text-sm mt-1">{role.coreResponsibility}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={onCancel} className="mt-6 text-zinc-500 hover:text-white text-sm">Cancel</button>
          </div>
        ) : (
          <div>
            <button onClick={() => setStep('select')} className="text-cyan-400 hover:underline mb-4">← Back to roles</button>
            <h3 className="text-xl font-bold text-white mb-2">{selectedRole?.title}</h3>
            <p className="text-zinc-400 mb-4">Select a duty or become the Head of this role:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleDutySelect(null)}
                className="w-full text-left bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="text-amber-300 font-bold">Head of Role</div>
                    <div className="text-zinc-400 text-sm">Oversee all activities and lead the team.</div>
                  </div>
                </div>
              </button>
              {selectedRole?.duties.map((duty, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDutySelect(idx)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono text-cyan-400">{duty.romanNumeral}</span>
                    <div>
                      <div className="text-white font-medium">{duty.title}</div>
                      <div className="text-zinc-400 text-sm line-clamp-2">{duty.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {loading && <div className="mt-4 text-center text-cyan-400">Assigning role... ⏳</div>}
          </div>
        )}
      </div>
    </div>
  );
}