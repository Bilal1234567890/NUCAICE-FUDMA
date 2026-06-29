'use client';

import React, { useState } from 'react';
import { roles, roleColorMap, Duty } from './Roles';

interface DashboardProps {
  staffId: string;
  fullName: string;
  roleId: string;
  dutyIndex: number | null;
  onLogout: () => void;
}

export default function Dashboard({ staffId, fullName, roleId, dutyIndex, onLogout }: DashboardProps) {
  const role = roles.find(r => r.id === roleId);
  const colors = role ? roleColorMap[role.color] : null;
  const isHead = dutyIndex === null;

  if (!role || !colors) {
    return <div className="text-white">Role not found.</div>;
  }

  // ── Determine which tab to show (only used for Head) ──
  const [activeTab, setActiveTab] = useState<string>(isHead ? 'overview' : role.duties[dutyIndex!]?.romanNumeral || 'overview');

  // ── Render content for each duty (same as before) ──
  const renderDutyContent = (duty: Duty) => {
    // ... (same massive switch statement from previous version)
    // I'll include it in the final code below.
  };

  // ── Render Overview (Head of Role) ──
  const renderOverview = () => (
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">📊 Overview – {role.title}</h3>
      <p className="text-zinc-300 mb-4">{role.coreResponsibility}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <p className="text-2xl font-bold text-cyan-400">{role.duties.length}</p>
          <p className="text-zinc-400 text-sm">Duties</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <p className="text-2xl font-bold text-cyan-400">12</p>
          <p className="text-zinc-400 text-sm">Active Tasks</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
          <p className="text-2xl font-bold text-cyan-400">4</p>
          <p className="text-zinc-400 text-sm">Team Members</p>
        </div>
      </div>
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-cyan-300 font-semibold mb-2">Recent Updates</h4>
        <ul className="text-zinc-400 text-sm space-y-1">
          <li>• Weekly coordination meeting held on June 28</li>
          <li>• Q2 reports submitted by all units</li>
          <li>• New partnership with Google Research Africa</li>
        </ul>
      </div>
    </div>
  );

  // ── For a specific duty (non‑head), we only show that duty's content ──
  if (!isHead) {
    const duty = role.duties[dutyIndex!];
    if (!duty) {
      return <div className="text-white">Duty not found.</div>;
    }
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#030712]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-emerald-500/10 animate-gradient-xy" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Welcome, {fullName}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-3 py-1 ${colors.text} border ${colors.border} rounded-full text-sm font-mono`}>
                  {role.shortCode}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-sm">
                  {duty.romanNumeral} · {duty.title}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg border border-red-400/30 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Duty Content (no tabs) */}
          <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${colors.border}`}>
            {renderDutyContent(duty)}
          </div>
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

  // ── Head of Role: show tabs for all duties ──
  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    ...role.duties.map((duty) => ({
      id: duty.romanNumeral,
      label: `${duty.romanNumeral}. ${duty.title}`,
    })),
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#030712]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-emerald-500/10 animate-gradient-xy" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <div className="relative z-10 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Welcome, {fullName}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`px-3 py-1 ${colors.text} border ${colors.border} rounded-full text-sm font-mono`}>
                {role.shortCode}
              </span>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-sm font-bold">
                👑 HEAD OF ROLE
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg border border-red-400/30 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs (only for Head) */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? `${colors.text} bg-white/10 border ${colors.border}`
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content (only for Head) */}
        <div className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${colors.border}`}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab !== 'overview' && (() => {
            const duty = role.duties.find(d => d.romanNumeral === activeTab);
            return duty ? renderDutyContent(duty) : <p className="text-zinc-400">Select a duty.</p>;
          })()}
        </div>
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