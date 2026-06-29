'use client';

import React, { useState } from 'react';
import { roles, roleColorMap, Duty } from './Roles';

interface DashboardProps {
  fullName: string;
  roleId: string;
  dutyIndex: number | null;
  onLogout: () => void;
}

export default function Dashboard({ fullName, roleId, dutyIndex, onLogout }: DashboardProps) {
  const role = roles.find(r => r.id === roleId);
  const colors = role ? roleColorMap[role.color] : null;
  const isHead = dutyIndex === null;

  // ── Compute initial tab (must be before any early return) ──
  const getInitialTab = () => {
    if (!role) return 'overview';
    return isHead ? 'overview' : role.duties[dutyIndex!]?.romanNumeral || 'overview';
  };

  // ── useState called unconditionally ──
  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // ── Early return after all hooks ──
  if (!role || !colors) {
    return <div className="text-white">Role not found.</div>;
  }

  // ── Render content for each duty ──
  const renderDutyContent = (duty: Duty) => {
    switch (duty.romanNumeral) {
      // ── CPC Duties ──
      case 'I':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Strategic Leadership</h4>
            <p className="text-zinc-300">Set the vision, goals, and annual work plan for NUCAICE in line with FUDMA&apos;s mandate.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-cyan-300 font-semibold">Vision Statement</h5>
                <p className="text-zinc-400 text-sm">To be a leading center of excellence in AI and Cyber Engineering.</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-cyan-300 font-semibold">2026 Goals</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Increase research output by 20%</li>
                  <li>Train 500 staff & students</li>
                  <li>Secure 3 new partnerships</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'II':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Stakeholder Engagement</h4>
            <p className="text-zinc-300">Liaise with university management, industry partners, government agencies, and funding bodies on behalf of the Center.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-cyan-300 font-semibold">Current Partners</p>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>NITDA – Government Agency</li>
                  <li>Google Research Africa – Industry</li>
                  <li>UNESCO – International Organization</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'III':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Resource Mobilization</h4>
            <p className="text-zinc-300">Identify and pursue funding, grants, and partnerships to support Center activities.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-cyan-300 font-semibold">Current Funding</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>NITDA: $50,000</li>
                  <li>Google: $30,000</li>
                  <li>FUDMA: ₦15M</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-cyan-300 font-semibold">Pending Grants</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>World Bank – AI in Education</li>
                  <li>Facebook – Responsible AI</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'IV':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Oversight & Coordination</h4>
            <p className="text-zinc-300">Supervise all units/officers, ensure alignment with the Center&apos;s objectives, and resolve operational issues.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <p className="text-2xl font-bold text-cyan-400">4</p>
                <p className="text-zinc-400 text-sm">Units Supervised</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <p className="text-2xl font-bold text-cyan-400">12</p>
                <p className="text-zinc-400 text-sm">Active Projects</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                <p className="text-2xl font-bold text-cyan-400">0</p>
                <p className="text-zinc-400 text-sm">Pending Issues</p>
              </div>
            </div>
          </div>
        );
      case 'V':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Reporting & Accountability</h4>
            <p className="text-zinc-300">Present quarterly and annual reports to university management and partners. Chair weekly coordination meetings.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-cyan-300 font-semibold">Recent Reports</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Q2 2026 – AI-RCU Report (Submitted)</li>
                  <li>May Training Summary (Under Review)</li>
                  <li>Admin Weekly Update (Approved)</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'VI':
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Program Approval</h4>
            <p className="text-zinc-300">Approve training schedules, research projects, and consultancy engagements before execution.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-amber-300 font-semibold">Pending Approvals</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>AI Bootcamp for Staff – CTO</li>
                  <li>Cybersecurity in Education – AI-RCU</li>
                  <li>Data Analytics for FUDMA – AI-RCU</li>
                </ul>
              </div>
            </div>
          </div>
        );

      // ── AI-RCU Duties ──
      case 'I': // Research Leadership (AI-RCU)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Research Leadership</h4>
            <p className="text-zinc-300">Initiate and coordinate research projects in AI, machine learning, and related fields.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Ongoing Projects</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>AI for Agriculture</li>
                  <li>Cybersecurity in Education</li>
                  <li>NLP for Local Languages</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Collaborations</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>FUDMA – Computer Science</li>
                  <li>University of Ibadan – AI Research</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'II': // Consultation Services (AI-RCU)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Consultation Services</h4>
            <p className="text-zinc-300">Manage consultancy requests from industry, government, and academia.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Active Consultancies</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Data Analytics for FUDMA</li>
                  <li>AI Strategy for Ministry of Education</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'III': // Grant & Proposal Development (AI-RCU)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Grant & Proposal Development</h4>
            <p className="text-zinc-300">Identify funding opportunities and lead proposal writing.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Submitted Proposals</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>World Bank – AI in Education</li>
                  <li>Facebook – Responsible AI</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Funding Sources</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>NITDA</li>
                  <li>Google Research</li>
                  <li>UNESCO</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'IV': // Knowledge Dissemination (AI-RCU)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Knowledge Dissemination</h4>
            <p className="text-zinc-300">Organize seminars, publish research outputs, and promote NUCAICE&apos;s research profile.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-purple-300 font-semibold">Upcoming Seminars</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>AI in Healthcare – July 15</li>
                  <li>Responsible AI – August 5</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'V': // Reporting (AI-RCU)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Reporting</h4>
            <p className="text-zinc-300">Submit quarterly reports on research progress, publications, and consultancy projects to the Coordinator.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-purple-300 font-semibold">Recent Reports</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>Q2 2026 – Submitted</li>
                <li>Q1 2026 – Approved</li>
              </ul>
            </div>
          </div>
        );

      // ── CTO Duties ──
      case 'I': // Curriculum & Training Design (CTO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Curriculum & Training Design</h4>
            <p className="text-zinc-300">Develop modules on AI, data science, robotics, and digital skills.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-emerald-300 font-semibold">Modules</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Introduction to AI</li>
                  <li>Data Science with Python</li>
                  <li>Robotics Fundamentals</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-emerald-300 font-semibold">Training Calendar</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Bootcamp – July 20-24</li>
                  <li>Workshop – August 10-12</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'II': // Program Coordination (CTO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Program Coordination</h4>
            <p className="text-zinc-300">Schedule workshops, boot camps, and short courses. Manage registration and attendance.</p>
            <div className="mt-4 space-y-3">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-emerald-300 font-semibold">Upcoming Programs</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>AI Bootcamp – July 20-24</li>
                  <li>Data Science Workshop – August 10-12</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'III': // Facilitator Management (CTO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Facilitator Management</h4>
            <p className="text-zinc-300">Identify trainers, prepare facilitator guides, and ensure quality delivery.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-emerald-300 font-semibold">Facilitators</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>Dr. A. Musa – AI Specialist</li>
                <li>Engr. B. Ibrahim – Data Scientist</li>
              </ul>
            </div>
          </div>
        );
      case 'IV': // Certification & Records (CTO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Certification & Records</h4>
            <p className="text-zinc-300">Oversee issuance of certificates and maintain training records.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-emerald-300 font-semibold">Recent Certifications</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>AI Essentials – 50 participants (June)</li>
                <li>Data Science – 30 participants (May)</li>
              </ul>
            </div>
          </div>
        );
      case 'V': // Reporting (CTO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Reporting</h4>
            <p className="text-zinc-300">Submit monthly reports on training activities, attendance, and impact to the Coordinator.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-emerald-300 font-semibold">Recent Reports</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>June 2026 – Submitted</li>
                <li>May 2026 – Approved</li>
              </ul>
            </div>
          </div>
        );

      // ── CDO Duties ──
      case 'I': // Office Administration (CDO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Office Administration</h4>
            <p className="text-zinc-300">Maintain files, correspondence, and appointments. Manage incoming/outgoing communication.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-amber-300 font-semibold">Pending Tasks</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Draft memo for VC</li>
                  <li>Schedule meeting with partners</li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="text-amber-300 font-semibold">Recent Correspondence</h5>
                <ul className="text-zinc-400 text-sm list-disc list-inside">
                  <li>Email from NITDA – June 25</li>
                  <li>Letter from FUDMA – June 20</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'II': // Stakeholder Liaison (CDO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Stakeholder Liaison</h4>
            <p className="text-zinc-300">Handle inquiries from students, staff, partners, and external organizations.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-amber-300 font-semibold">Recent Inquiries</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>Student – AI course enrollment (June 26)</li>
                <li>Partner – Collaboration request (June 24)</li>
              </ul>
            </div>
          </div>
        );
      case 'III': // Documentation (CDO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Documentation</h4>
            <p className="text-zinc-300">Prepare minutes, memos, and official letters. Maintain a database of NUCAICE members and partners.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-amber-300 font-semibold">Recent Documents</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>Meeting Minutes – June 20</li>
                <li>Partner Database – Updated</li>
              </ul>
            </div>
          </div>
        );
      case 'IV': // Logistics Support (CDO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Logistics Support</h4>
            <p className="text-zinc-300">Coordinate venues, materials, and logistics for events and training.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-amber-300 font-semibold">Upcoming Events</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>AI Bootcamp – Venue: Lab 101</li>
                <li>Stakeholder Webinar – Virtual</li>
              </ul>
            </div>
          </div>
        );
      case 'V': // Reporting (CDO)
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Reporting</h4>
            <p className="text-zinc-300">Provide weekly activity updates and maintain records of Center operations.</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <h5 className="text-amber-300 font-semibold">Recent Reports</h5>
              <ul className="text-zinc-400 text-sm list-disc list-inside">
                <li>Week 26 – Submitted</li>
                <li>Week 25 – Approved</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h4 className="text-xl font-bold text-white mb-4">{duty.title}</h4>
            <p className="text-zinc-300">{duty.description}</p>
            <div className="mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-zinc-400 text-sm">Content for this duty is being developed.</p>
            </div>
          </div>
        );
    }
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

  // ── For a specific duty (non‑head) ──
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