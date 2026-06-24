'use client';

import React from 'react';
import { roles, roleColorMap } from './Roles';

interface DashboardProps {
  staffId: string;
  fullName: string;
  roleId: string;
  dutyIndex: number | null;
  onLogout: () => void;
}

export default function Dashboard({ staffId, fullName, roleId, dutyIndex, onLogout }: DashboardProps) {
  const role = roles.find(r => r.id === roleId);
  const isHead = dutyIndex === null;
  const duty = isHead ? null : role?.duties[dutyIndex!];
  const colors = role ? roleColorMap[role.color] : null;

  if (!role || !colors) {
    return <div className="text-white">Role not found.</div>;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#030712]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-emerald-500/10 animate-gradient-xy" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Welcome, {fullName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-3 py-1 ${colors.text} border ${colors.border} rounded-full text-sm font-mono`}>
                {role.shortCode}
              </span>
              {isHead && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-sm font-bold">
                  👑 HEAD OF ROLE
                </span>
              )}
              {!isHead && duty && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-sm">
                  {duty.romanNumeral} · {duty.title}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg border border-red-400/30 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${colors.border}`}>
            <h3 className={`text-xl font-bold ${colors.text}`}>Role Overview</h3>
            <p className="text-zinc-300 mt-2">{role.coreResponsibility}</p>
          </div>
          <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${colors.border}`}>
            <h3 className={`text-xl font-bold ${colors.text}`}>Your Focus</h3>
            {isHead ? (
              <p className="text-zinc-300 mt-2">You are the Head of this role. Oversee all duties and lead the team.</p>
            ) : (
              <div>
                <p className="text-cyan-400 font-semibold">{duty?.title}</p>
                <p className="text-zinc-300 mt-1">{duty?.description}</p>
              </div>
            )}
          </div>
          <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${colors.border}`}>
            <h3 className={`text-xl font-bold ${colors.text}`}>Recent Activity</h3>
            <p className="text-zinc-300 mt-2">No recent activity.</p>
          </div>
        </div>

        {/* Additional role-specific content can be added here */}
      </div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }
      `}</style>
    </div>
  );
}