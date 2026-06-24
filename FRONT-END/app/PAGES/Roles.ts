// app/PAGES/Roles.ts
export interface Duty {
  title: string;
  romanNumeral: string;
  description: string;
}

export interface Role {
  id: string;
  title: string;
  shortCode: string;
  number: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  icon: string;
  coreResponsibility: string;
  duties: Duty[];
}

export const roleColorMap: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    headingBg: string;
    dutyBg: string;
    romanBg: string;
    hex: string;
    sidebarActive: string;
  }
> = {
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/20',
    border: 'border-cyan-400/40',
    text: 'text-cyan-300',
    badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    headingBg: 'bg-gradient-to-r from-cyan-900/60 to-cyan-800/30',
    dutyBg: 'bg-cyan-950/40 border-cyan-400/20',
    romanBg: 'bg-cyan-500/20 text-cyan-300',
    hex: '#22d3ee',
    sidebarActive: 'border-l-2 border-cyan-400 bg-cyan-400/10',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-900/40 to-purple-800/20',
    border: 'border-purple-400/40',
    text: 'text-purple-300',
    badge: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
    headingBg: 'bg-gradient-to-r from-purple-900/60 to-purple-800/30',
    dutyBg: 'bg-purple-950/40 border-purple-400/20',
    romanBg: 'bg-purple-500/20 text-purple-300',
    hex: '#a78bfa',
    sidebarActive: 'border-l-2 border-purple-400 bg-purple-400/10',
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/20',
    border: 'border-emerald-400/40',
    text: 'text-emerald-300',
    badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    headingBg: 'bg-gradient-to-r from-emerald-900/60 to-emerald-800/30',
    dutyBg: 'bg-emerald-950/40 border-emerald-400/20',
    romanBg: 'bg-emerald-500/20 text-emerald-300',
    hex: '#34d399',
    sidebarActive: 'border-l-2 border-emerald-400 bg-emerald-400/10',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-900/40 to-amber-800/20',
    border: 'border-amber-400/40',
    text: 'text-amber-300',
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    headingBg: 'bg-gradient-to-r from-amber-900/60 to-amber-800/30',
    dutyBg: 'bg-amber-950/40 border-amber-400/20',
    romanBg: 'bg-amber-500/20 text-amber-300',
    hex: '#fbbf24',
    sidebarActive: 'border-l-2 border-amber-400 bg-emerald-400/10',
  },
};

export const roles: Role[] = [
  {
    id: 'cpc',
    title: 'Center Programme Coordinator',
    shortCode: 'CPC',
    number: 1,
    color: 'cyan',
    gradientFrom: '#0891b2',
    gradientTo: '#0e7490',
    borderColor: 'border-cyan-400/50',
    icon: '🎯',
    coreResponsibility:
      'Provide overall leadership, strategic direction, and representation for the Center.',
    duties: [
      { romanNumeral: 'I', title: 'Strategic Leadership', description: "Set the vision, goals, and annual work plan for NUCAICE in line with FUDMA's mandate." },
      { romanNumeral: 'II', title: 'Stakeholder Engagement', description: 'Liaise with university management, industry partners, government agencies, and funding bodies on behalf of the Center.' },
      { romanNumeral: 'III', title: 'Resource Mobilization', description: 'Identify and pursue funding, grants, and partnerships to support Center activities.' },
      { romanNumeral: 'IV', title: 'Oversight & Coordination', description: "Supervise all units/officers, ensure alignment with the Center's objectives, and resolve operational issues." },
      { romanNumeral: 'V', title: 'Reporting & Accountability', description: 'Present quarterly and annual reports to university management and partners. Chair weekly coordination meetings.' },
      { romanNumeral: 'VI', title: 'Program Approval', description: 'Approve training schedules, research projects, and consultancy engagements before execution.' },
    ],
  },
  {
    id: 'aircu',
    title: 'Head, AI Research and Consultation Unit',
    shortCode: 'AI-RCU',
    number: 2,
    color: 'purple',
    gradientFrom: '#7c3aed',
    gradientTo: '#6d28d9',
    borderColor: 'border-purple-400/50',
    icon: '🔬',
    coreResponsibility:
      'Drive research projects and provide AI/AI-related consultancy services to the university and external clients.',
    duties: [
      { romanNumeral: 'I', title: 'Research Leadership', description: 'Initiate and coordinate research projects in AI, machine learning, and related fields. Seek collaborations within FUDMA and externally.' },
      { romanNumeral: 'II', title: 'Consultation Services', description: 'Manage consultancy requests from industry, government, and academia. Ensure timely delivery of solutions and reports.' },
      { romanNumeral: 'III', title: 'Grant & Proposal Development', description: 'Identify funding opportunities and lead proposal writing.' },
      { romanNumeral: 'IV', title: 'Knowledge Dissemination', description: "Organize seminars, publish research outputs, and promote NUCAICE's research profile." },
      { romanNumeral: 'V', title: 'Reporting', description: 'Submit quarterly reports on research progress, publications, and consultancy projects to the Coordinator.' },
    ],
  },
  {
    id: 'cto',
    title: 'Center Training Officer',
    shortCode: 'CTO',
    number: 3,
    color: 'emerald',
    gradientFrom: '#059669',
    gradientTo: '#047857',
    borderColor: 'border-emerald-400/50',
    icon: '📚',
    coreResponsibility:
      'Plan and execute all training and capacity-building programs at NUCAICE.',
    duties: [
      { romanNumeral: 'I', title: 'Curriculum & Training Design', description: "Develop modules on AI, data science, robotics, and digital skills aligned with industry needs and FUDMA's academic calendar." },
      { romanNumeral: 'II', title: 'Program Coordination', description: 'Schedule workshops, boot camps, and short courses. Manage registration, attendance, and participant feedback.' },
      { romanNumeral: 'III', title: 'Facilitator Management', description: 'Identify trainers, prepare facilitator guides, and ensure quality delivery.' },
      { romanNumeral: 'IV', title: 'Certification & Records', description: 'Oversee issuance of certificates and maintain training records.' },
      { romanNumeral: 'V', title: 'Reporting', description: 'Submit monthly reports on training activities, attendance, and impact to the Coordinator.' },
    ],
  },
  {
    id: 'cdo',
    title: 'Center Desk Officer',
    shortCode: 'CDO',
    number: 4,
    color: 'amber',
    gradientFrom: '#d97706',
    gradientTo: '#b45309',
    borderColor: 'border-amber-400/50',
    icon: '🗂️',
    coreResponsibility:
      'Manage day-to-day administration and serve as the first point of contact for the Center.',
    duties: [
      { romanNumeral: 'I', title: 'Office Administration', description: 'Maintain files, correspondence, and appointments. Manage incoming/outgoing communication.' },
      { romanNumeral: 'II', title: 'Stakeholder Liaison', description: 'Handle inquiries from students, staff, partners, and external organizations. Schedule meetings for the Coordinator.' },
      { romanNumeral: 'III', title: 'Documentation', description: 'Prepare minutes, memos, and official letters. Maintain a database of NUCAICE members and partners.' },
      { romanNumeral: 'IV', title: 'Logistics Support', description: 'Coordinate venues, materials, and logistics for events and training.' },
      { romanNumeral: 'V', title: 'Reporting', description: 'Provide weekly activity updates and maintain records of Center operations.' },
    ],
  },
];