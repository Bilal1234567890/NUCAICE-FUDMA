'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import Registration from './PAGES/Registration';
import Login from './PAGES/Login';
import RoleSelection from './PAGES/RoleSelection';
import Dashboard from './PAGES/Dashboard';
import { roles, roleColorMap, Role, Duty } from './PAGES/Roles';

// ─────────────────────────────────────────────
// All helper components (fully implemented)
// ─────────────────────────────────────────────

function RoleTitleCanvas({
  title,
  colorHex,
  isDark,
}: {
  title: string;
  colorHex: string;
  isDark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    cancelAnimationFrame(frameRef.current);

    const text = title.toUpperCase();
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const fontSize = Math.min(32, Math.floor((W - 44) / (text.length * 0.62)));
    ctx.font = `700 ${fontSize}px "Courier New", "Lucida Console", monospace`;

    let frame = 0;
    const totalFrames = text.length * 3;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)';
      ctx.fillRect(0, 0, W, H);

      const charsVisible = Math.min(
        text.length,
        Math.floor((frame / totalFrames) * text.length) + 1
      );

      ctx.font = `700 ${fontSize}px "Courier New", "Lucida Console", monospace`;
      ctx.textBaseline = 'middle';
      ctx.shadowColor = colorHex;
      ctx.shadowBlur = 14;
      ctx.fillStyle = colorHex;

      const partial = text.slice(0, charsVisible);
      ctx.fillText(partial, 12, H / 2);

      if (charsVisible < text.length || Math.floor(Date.now() / 500) % 2 === 0) {
        const measured = ctx.measureText(partial);
        ctx.fillStyle = colorHex;
        ctx.shadowBlur = 8;
        ctx.fillRect(12 + measured.width + 2, H / 2 - fontSize * 0.5, 2, fontSize);
      }

      ctx.shadowBlur = 0;

      if (frame < totalFrames + 20) {
        frame++;
        frameRef.current = requestAnimationFrame(draw);
      } else {
        const blink = () => {
          ctx.clearRect(0, 0, W, H);
          ctx.fillStyle = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)';
          ctx.fillRect(0, 0, W, H);
          ctx.font = `700 ${fontSize}px "Courier New", "Lucida Console", monospace`;
          ctx.textBaseline = 'middle';
          ctx.shadowColor = colorHex;
          ctx.shadowBlur = 12;
          ctx.fillStyle = colorHex;
          ctx.fillText(text, 12, H / 2);
          ctx.shadowBlur = 0;
          frameRef.current = requestAnimationFrame(blink);
        };
        blink();
      }
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [title, colorHex, isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '80%', height: '18px', display: 'block' }}
    />
  );
}

function AnimatedSubmenu({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      style={{
        maxHeight: height,
        overflow: 'hidden',
        transition: 'max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

function HomeContent({
  onMakeEnquiry,
  onRoleClick,
  isDark,
}: {
  onMakeEnquiry: () => void;
  onRoleClick: (roleId: string) => void;
  isDark: boolean;
}) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;
    const container = logoRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/logo.png');

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const logoMesh = new THREE.Mesh(geometry, material);
    scene.add(logoMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      logoMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-zinc-500' : 'text-slate-500';
  const textCyan = isDark ? 'text-cyan-300' : 'text-cyan-700';
  const textGreen = isDark ? 'text-green-400' : 'text-green-700';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgCard = isDark ? 'bg-white/5' : 'bg-white/80';
  const bgGradient = isDark ? 'from-blue-900/60 via-cyan-900/40 to-blue-900/60' : 'from-blue-100/80 via-cyan-100/60 to-blue-100/80';
  const badgeBg = isDark ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-cyan-100 border-cyan-300';
  const noteBg = isDark ? 'from-blue-900/40 to-indigo-900/30' : 'from-blue-50 to-indigo-50';
  const noteBorder = isDark ? 'border-blue-400/30' : 'border-blue-300';
  const noteHeader = isDark ? 'bg-blue-900/50 border-blue-400/20' : 'bg-blue-100/80 border-blue-300';
  const noteHeaderText = isDark ? 'text-blue-300' : 'text-blue-800';
  const coreValueBg = isDark ? 'bg-cyan-400/10 border-cyan-400/20' : 'bg-cyan-50 border-cyan-300';
  const coreValueText = isDark ? 'text-cyan-400' : 'text-cyan-700';

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Letterhead with Rotating Logo */}
      <div className={`bg-linear-to-r ${bgGradient} border ${borderColor} rounded-xl p-4 text-center shrink-0`}>
        <div className="flex items-center justify-center gap-4 mb-2">
          <div
            ref={logoRef}
            className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/50"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}
          />
          <div className="text-left">
            <p className={`${textCyan} font-bold text-[15px] tracking-widest`}>FEDERAL UNIVERSITY DUTSINMA</p>
            <p className={`${textPrimary} font-semibold text-[15px] mt-0.5`}>NUC ARTIFICIAL INTELLIGENCE CENTER OF EXCELLENCE (NUCAICE)</p>
            <p className={`${textSecondary} text-[16px] mt-0.5`}>OFFICE OF THE VICE CHANCELLOR</p>
          </div>
        </div>
        <button
          onClick={onMakeEnquiry}
          className="inline-block mt-2 px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[13px] tracking-widest rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20 border border-cyan-400/30"
        >
          📧 Make Enquiry
        </button>
      </div>

      {/* Memo details + body */}
      <div className="flex gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left: Memo fields */}
        <div className="flex flex-col gap-3 shrink-0 w-55">
          <div className={`${bgCard} border ${borderColor} rounded-lg p-4`}>
            <div className="space-y-2 text-[15px]">
              <div>
                <p className={`${textMuted} text-[13px] uppercase tracking-wider font-semibold`}>Ref No</p>
                <p className={`${textSecondary} font-mono font-medium`}>NUCAICE/2026/001</p>
              </div>
              <div>
                <p className={`${textMuted} text-[13px] uppercase tracking-wider font-semibold`}>Date</p>
                <p className={`${textSecondary} font-medium`}>June 22, 2026</p>
              </div>
              <div>
                <p className={`${textMuted} text-[13px] uppercase tracking-wider font-semibold`}>To</p>
                <p className={`${textSecondary} font-medium`}>All Staff Members</p>
              </div>
              <div>
                <p className={`${textMuted} text-[13px] uppercase tracking-wider font-semibold`}>From</p>
                <p className={`${textSecondary} font-medium`}>Office of the Coordinator</p>
              </div>
              <div>
                <p className={`${textMuted} text-[13px] uppercase tracking-wider font-semibold`}>Subject</p>
                <p className={`${textCyan} font-bold`}>Schedule of Duties & Responsibilities</p>
              </div>
            </div>
          </div>

          <div className={`mt-auto bg-linear-to-br ${isDark ? 'from-cyan-900/20 to-blue-900/10' : 'from-cyan-50 to-blue-50'} border ${isDark ? 'border-cyan-400/20' : 'border-cyan-300'} rounded-lg p-4 text-right`}>
            <p className={`text-[15px] ${textMuted} italic font-medium`}>Signed,</p>
            <p className={`${textCyan} font-bold text-[16px] italic mt-1`}>Muhammad A. Unwala</p>
            <p className={`${textSecondary} text-[15px] mt-0.5 font-medium`}>Centre Programme Coordinator</p>
            <p className={`${textMuted} text-[14px] mt-0.5 font-medium`}>NUCAICE, FUDMA</p>
          </div>
        </div>

        {/* Right: Role cards grid + note */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-h-0 pr-1" style={{ scrollbarWidth: 'thin' }}>
          <p className={`${textSecondary} text-[16px] italic shrink-0 text-center font-medium`}>
            Find below the schedules of duties and responsibilities recommended from National University Commission and NUCAICE, Fudma Chapter.
          </p>

          {/* 2x2 Centered Grid */}
          <div className="grid grid-cols-2 gap-4 shrink-0 max-w-3xl mx-auto w-full">
            {roles.map((role) => {
              const c = roleColorMap[role.color];
              return (
                <button
                  key={role.id}
                  onClick={() => onRoleClick(role.id)}
                  className={`rounded-xl border text-left p-4 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 cursor-pointer ${c.bg} ${c.border}`}
                  style={{ boxShadow: `0 2px 16px ${role.gradientFrom}22` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{role.icon}</span>
                    <span className={`px-2 py-0.5 text-[13px] font-mono font-bold rounded border ${c.badge}`}>{role.shortCode}</span>
                  </div>
                  <p className={`font-bold text-[15px] mb-1 ${c.text}`}>{role.title}</p>
                  <p className={`text-[14px] ${isDark ? 'text-zinc-400' : 'text-slate-600'} leading-relaxed line-clamp-2 font-medium`}>{role.coreResponsibility}</p>
                  <div className={`mt-2 flex items-center gap-1 text-[13px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    <span className="font-medium">{role.duties.length} duties</span>
                    <span className={`ml-auto font-bold ${c.text}`}>View →</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Core values */}
          <div className="flex flex-wrap gap-2 justify-center shrink-0">
            {[{ label: 'Excellence', emoji: '⭐' }, { label: 'Innovation', emoji: '💡' }, { label: 'Integrity', emoji: '🛡️' }, { label: 'Collaboration', emoji: '🤝' }, { label: 'Impact', emoji: '🚀' }].map((v) => (
              <span key={v.label} className={`px-3 py-1.5 ${coreValueBg} rounded-full ${coreValueText} text-[14px] font-bold flex items-center gap-1.5`}>
                {v.emoji} {v.label}
              </span>
            ))}
          </div>

          {/* Centered Note */}
          <div className={`max-w-3xl mx-auto w-full bg-linear-to-br ${noteBg} border ${noteBorder} rounded-xl overflow-hidden shrink-0`}>
            <div className={`${noteHeader} px-4 py-2.5 border-b`}>
              <h4 className={`font-bold ${noteHeaderText} uppercase tracking-widest text-[14px]`}>📋 NOTE — General Expectation for All Officers</h4>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { n: 'I', t: "Maintain professionalism and uphold NUCAICE's reputation." },
                { n: 'II', t: "Work collaboratively to achieve the Center's strategic goals." },
                { n: 'III', t: 'Attend weekly/monthly coordination meetings every first Monday of a month.' },
                { n: 'IV', t: 'Submit reports periodic on time and keep the Coordinator informed.' },
              ].map((item) => (
                <div key={item.n} className="flex gap-2 items-start">
                  <span className={`shrink-0 w-6 h-6 flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-300 border-blue-400/20' : 'bg-blue-100 text-blue-700 border-blue-300'} font-bold text-[13px] rounded border`}>{item.n}</span>
                  <p className={`${isDark ? 'text-zinc-300' : 'text-slate-700'} text-[15px] leading-relaxed font-medium`}>{item.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionContent({ isDark }: { isDark: boolean }) {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;
    const container = logoRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/logo.png');

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const logoMesh = new THREE.Mesh(geometry, material);
    scene.add(logoMesh);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      logoMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-zinc-300' : 'text-slate-700';
  const textCyan = isDark ? 'text-cyan-300' : 'text-cyan-700';
  const textEmerald = isDark ? 'text-emerald-300' : 'text-emerald-700';

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      <div className={`text-center ${isDark ? 'border-b border-white/10' : 'border-b border-slate-200'} pb-2 flex-shrink-0`}>
        <div className="flex items-center justify-center gap-4 mb-2">
          <div
            ref={logoRef}
            className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-400/50"
            style={{ boxShadow: '0 0 20px rgba(34,211,238,0.3)' }}
          />
          <div className="text-left">
            <p className={`text-[22px] ${textCyan} font-bold tracking-widest`}>FEDERAL UNIVERSITY DUTSINMA</p>
            <p className={`${textSecondary} text-[28px] font-medium`}>NUC Artificial Intelligence Center of Excellence (NUCAICE)</p>
          </div>
        </div>
        <p className={`text-[22px] ${textCyan} font-mono uppercase tracking-widest mt-0.5 font-bold`}>Mission & Vision Statement</p>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden min-h-0">
        {/* MISSION */}
        <div className={`rounded-xl border ${isDark ? 'border-emerald-400/40' : 'border-emerald-300'} bg-gradient-to-br ${isDark ? 'from-emerald-900/40 to-emerald-800/20' : 'from-emerald-50 to-emerald-100/50'} overflow-hidden flex flex-col`} style={{ boxShadow: '0 14px 5px #05966922' }}>
          <div className={`bg-gradient-to-r ${isDark ? 'from-emerald-900/60 to-emerald-800/30' : 'from-emerald-100 to-emerald-200/50'} px-4 py-2 border-b ${isDark ? 'border-emerald-400/20' : 'border-emerald-300'} flex items-center gap-2 flex-shrink-0`}>
            <span className="text-lg">🎯</span>
            <h3 className={`text-sm font-bold ${textEmerald} uppercase tracking-wider`}>Mission</h3>
          </div>
          <div className="p-3 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
            <p className={`${isDark ? 'text-zinc-300' : 'text-slate-700'} text-[18px] leading-relaxed mb-2 font-medium`}>To advance research, education, and industry collaboration in AI and Cyber Engineering by:</p>
            <ol className="space-y-1.5">
              {[
                'Conducting high-impact research addressing real-world challenges in health, agriculture, security, education, and governance.',
                'Building human capacity through specialized training, certification programs, and mentorship in AI, data science, robotics, and cyber security.',
                'Fostering industry and government partnerships to translate research into practical solutions, startups, and policy support.',
                'Promoting ethical and responsible AI aligned with national values and societal well-being.',
                'Providing consultancy, innovation hubs, and open-access platforms for knowledge sharing.',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className={`shrink-0 w-4 h-4 flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/20' : 'bg-emerald-100 text-emerald-700 border-emerald-300'} font-bold text-[12px] rounded border`}>{i + 1}</span>
                  <p className={`${isDark ? 'text-zinc-300' : 'text-slate-700'} text-[18px] leading-relaxed font-medium`}>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {/* VISION */}
        <div className={`rounded-xl border ${isDark ? 'border-cyan-400/40' : 'border-cyan-300'} bg-gradient-to-br ${isDark ? 'from-cyan-900/40 to-cyan-800/20' : 'from-cyan-50 to-cyan-100/50'} overflow-hidden flex flex-col`} style={{ boxShadow: '0 4px 20px #22d3ee22' }}>
          <div className={`bg-gradient-to-r ${isDark ? 'from-cyan-900/60 to-cyan-800/30' : 'from-cyan-100 to-cyan-200/50'} px-4 py-2 border-b ${isDark ? 'border-cyan-400/20' : 'border-cyan-300'} flex items-center gap-2 flex-shrink-0`}>
            <span className="text-lg">🔭</span>
            <h3 className={`text-sm font-bold ${textCyan} uppercase tracking-wider`}>Vision</h3>
          </div>
          <div className="p-3 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
            <p className={`${isDark ? 'text-zinc-200' : 'text-slate-800'} text-[18px] leading-relaxed mb-3 font-medium`}>
              To be a leading center of excellence in Artificial Intelligence, Cyber Engineering, and Digital Innovation in Africa, producing cutting-edge research, skilled talent, and technological solutions that drive sustainable development and national competitiveness.
            </p>
            <div className={`${isDark ? 'bg-cyan-950/40 border-cyan-400/10' : 'bg-cyan-50 border-cyan-300'} rounded-lg p-3 border`}>
              <h4 className={`font-bold ${textCyan} text-[22px] uppercase tracking-widest mb-2`}>Core Values</h4>
              <div className="space-y-1.5">
                {[
                  { n: '1)', label: 'Excellence', desc: 'Commitment to high-quality research and training.' },
                  { n: '2)', label: 'Innovation', desc: 'Encouraging creative problem-solving and entrepreneurship.' },
                  { n: '3)', label: 'Integrity', desc: 'Upholding ethical standards in AI development and use.' },
                  { n: '4)', label: 'Collaboration', desc: 'Working across disciplines, institutions, and sectors.' },
                  { n: '5)', label: 'Impact', desc: 'Focusing on solutions that create measurable social and economic value.' },
                ].map((v) => (
                  <div key={v.label} className="flex gap-1.5 items-start text-[18px]">
                    <span className={`${textCyan} font-bold shrink-0`}>{v.n}</span>
                    <span className="font-medium"><strong className={`${textCyan}`}>{v.label}:</strong> <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{v.desc}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define type for the color object returned from roleColorMap
type ColorPalette = (typeof roleColorMap)[keyof typeof roleColorMap];

function RoleContent({
  activeRole,
  activeColors,
  activeDutyIndex,
  onDutyClick,
  onSetActiveDutyIndex,
  isDark,
}: {
  activeRole: Role;
  activeColors: ColorPalette;
  activeDutyIndex: number | null;
  onDutyClick: (index: number) => void;
  onSetActiveDutyIndex: (index: number | null) => void;
  isDark: boolean;
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden gap-2">
      {/* WGL Title Banner */}
      <div
        className={`flex-shrink-0 rounded-xl border overflow-hidden ${activeColors.bg} ${activeColors.border}`}
        style={{ boxShadow: `0 4px 24px ${activeRole.gradientFrom}33` }}
      >
        <div className={`px-4 py-2 border-b ${activeColors.border} ${activeColors.headingBg}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{activeRole.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded border ${activeColors.badge}`}>
                  #{activeRole.number} · {activeRole.shortCode}
                </span>
              </div>
              <RoleTitleCanvas
                title={`${activeRole.number}. ${activeRole.title}`}
                colorHex={activeColors.hex}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
        <div className="px-4 py-2">
          <span className={`inline-block px-2 py-0.5 rounded text-[29px] font-bold uppercase tracking-widest mb-1 ${activeColors.romanBg}`}>Core Responsibility</span>
          <p className={`${isDark ? 'text-white' : 'text-slate-900'} text-[26px] leading-relaxed font-bold`}>{activeRole.coreResponsibility}</p>
        </div>
      </div>

      {/* Duties Section */}
      <div className="flex-1 flex gap-2 overflow-hidden min-h-0 relative">
        <div
          className={`flex-shrink-0 flex flex-col gap-1 overflow-y-auto transition-all duration-500 ${activeDutyIndex !== null ? 'w-[42%]' : 'w-full'}`}
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className={`flex-shrink-0 inline-block px-2 py-0.5 rounded text-[19px] font-bold uppercase tracking-widest ${activeColors.romanBg} w-fit`}>
            Duties &amp; Activities
          </div>
          {activeRole.duties.map((duty: Duty, i: number) => (
            <button
              key={i}
              onClick={() => onDutyClick(i)}
              className={`w-full flex gap-2 items-start p-2 rounded-lg border text-left transition-all duration-200 hover:brightness-110 text-[10px] ${
                activeDutyIndex === i
                  ? `${activeColors.dutyBg} ${activeColors.border} scale-[0.98]`
                  : `${isDark ? 'border-white/8 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-100'}`
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center rounded text-[18px] font-bold shrink-0 border ${activeDutyIndex === i ? activeColors.romanBg : isDark ? 'bg-white/5 text-zinc-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-300'}`}>
                {duty.romanNumeral}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-[14px] uppercase tracking-wide ${activeDutyIndex === i ? activeColors.text : isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  {duty.title}
                </p>
                {activeDutyIndex !== i && (
                  <p className={`${isDark ? 'text-zinc-500' : 'text-slate-500'} text-[9px] leading-relaxed mt-0.5 line-clamp-1 font-medium`}>{duty.description}</p>
                )}
              </div>
              <span className={`text-xs transition-transform duration-300 flex-shrink-0 ${activeDutyIndex === i ? `${activeColors.text} rotate-90` : isDark ? 'text-zinc-600' : 'text-slate-400'}`}>›</span>
            </button>
          ))}
        </div>

        <div
          className="flex-1 overflow-hidden transition-all duration-500"
          style={{
            maxWidth: activeDutyIndex !== null ? '58%' : '0%',
            opacity: activeDutyIndex !== null ? 1 : 0,
          }}
        >
          {activeDutyIndex !== null && activeRole.duties[activeDutyIndex] && (
            <div
              className={`h-full rounded-xl border p-4 flex flex-col gap-3 ${activeColors.bg} ${activeColors.border}`}
              style={{ boxShadow: `0 4px 24px ${activeRole.gradientFrom}33`, animation: 'slideInRight 0.35s cubic-bezier(0.4,0,0.2,1)' }}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-[16px] shrink-0 border ${activeColors.romanBg}`}>
                  {activeRole.duties[activeDutyIndex].romanNumeral}
                </span>
                <h4 className={`font-bold text-xs uppercase tracking-wider ${activeColors.text}`}>
                  {activeRole.duties[activeDutyIndex].title}
                </h4>
                <button
                  onClick={() => onSetActiveDutyIndex(null)}
                  className={`ml-auto ${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} text-xs flex-shrink-0`}
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className={`flex-1 rounded-lg border p-3 overflow-y-auto ${activeColors.dutyBg}`} style={{ scrollbarWidth: 'thin' }}>
                <p className={`${isDark ? 'text-zinc-200' : 'text-slate-800'} text-[19px] leading-relaxed font-medium`}>{activeRole.duties[activeDutyIndex].description}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap flex-shrink-0">
                {activeRole.duties.map((d: Duty, i: number) => (
                  <button
                    key={i}
                    onClick={() => onSetActiveDutyIndex(i)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all ${i === activeDutyIndex ? `${activeColors.romanBg} ${activeColors.border}` : `${isDark ? 'border-white/10 text-zinc-500 hover:bg-white/5' : 'border-slate-300 text-slate-500 hover:bg-slate-100'}`}`}
                  >
                    {d.romanNumeral}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

// Define the shape of the user object returned by the backend
interface User {
  staff_id: string;
  full_name: string;
  email: string;
  role_id?: string | null;
  duty_index?: number | null;
}

export default function NUCAICEPage() {
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'mission' | 'role' | 'registration' | 'login'>('home');
  const [activeRoleId, setActiveRoleId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeDutyIndex, setActiveDutyIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [contentExiting, setContentExiting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  /* ── Theme Toggle Effect ─────────────────── */
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  /* ── 3D Background ─────────────────── */
  useEffect(() => {
    const container = document.getElementById('bg-canvas-container');
    if (!container) return;

    const oldCanvas = bgCanvasRef.current;
    if (oldCanvas) {
      oldCanvas.remove();
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'fixed inset-0 z-0 pointer-events-none';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.background = isDark ? 'transparent' : '#f8fafc';
    container.insertBefore(canvas, container.firstChild);
    bgCanvasRef.current = canvas;

    const scene = new THREE.Scene();
    if (!isDark) {
      scene.background = new THREE.Color(0xf8fafc);
    }

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: isDark,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 30;

    let animId: number;
    let t = 0;

    if (isDark) {
      // ===== DARK MODE: Cyberpunk particles with rings =====
      const particlesCount = 1200;
      const posArray = new Float32Array(particlesCount * 3);
      const colorsArray = new Float32Array(particlesCount * 3);
      const palette = [0x22d3ee, 0x818cf8, 0x34d399, 0xf59e0b];

      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 100;
        posArray[i + 1] = (Math.random() - 0.5) * 100;
        posArray[i + 2] = (Math.random() - 0.5) * 100;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colorsArray[i] = ((c >> 16) & 255) / 255;
        colorsArray[i + 1] = ((c >> 8) & 255) / 255;
        colorsArray[i + 2] = (c & 255) / 255;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      const material = new THREE.PointsMaterial({
        size: 0.18,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const particlesMesh = new THREE.Points(geometry, material);
      scene.add(particlesMesh);

      const lineColors = [0x22d3ee, 0x818cf8, 0x34d399];
      const lines: THREE.Line[] = [];
      for (let i = 0; i < 120; i++) {
        const lc = lineColors[i % lineColors.length];
        const lineMat = new THREE.LineBasicMaterial({
          color: lc,
          transparent: true,
          opacity: 0.06 + Math.random() * 0.06
        });
        const pts = [];
        for (let j = 0; j < 2; j++) {
          const idx = Math.floor(Math.random() * particlesCount);
          pts.push(new THREE.Vector3(posArray[idx * 3], posArray[idx * 3 + 1], posArray[idx * 3 + 2]));
        }
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(lineGeom, lineMat);
        scene.add(line);
        lines.push(line);
      }

      const rings: THREE.Mesh[] = [];
      const ringColors = [0x22d3ee, 0x818cf8, 0x34d399, 0xf59e0b];
      for (let r = 0; r < 5; r++) {
        const tg = new THREE.TorusGeometry(6 + r * 3, 0.06 + Math.random() * 0.06, 8, 60);
        const tm = new THREE.MeshBasicMaterial({
          color: ringColors[r % ringColors.length],
          transparent: true,
          opacity: 0.1 + r * 0.02
        });
        const torus = new THREE.Mesh(tg, tm);
        torus.rotation.x = Math.random() * Math.PI;
        torus.rotation.y = Math.random() * Math.PI;
        scene.add(torus);
        rings.push(torus);
      }

      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.003;
        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0002;
        rings.forEach((ring, i) => {
          ring.rotation.x += 0.0008 * (i % 2 === 0 ? 1 : -1);
          ring.rotation.y += 0.0006 * (i % 3 === 0 ? 1 : -1);
          ring.position.y = Math.sin(t + i) * 2;
        });
        lines.forEach((line, i) => {
          line.rotation.y += 0.0001 * (i % 3 === 0 ? 1 : -1);
        });
        renderer.render(scene, camera);
      };
      animate();

      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        lines.forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
        rings.forEach(r => { r.geometry.dispose(); (r.material as THREE.Material).dispose(); });
        if (canvas.parentElement) canvas.remove();
      };

    } else {
      // ===== LIGHT MODE: Warm, soft, elegant background =====
      const particlesCount = 800;
      const posArray = new Float32Array(particlesCount * 3);
      const colorsArray = new Float32Array(particlesCount * 3);
      const palette = [0xf59e0b, 0xf97316, 0x3b82f6, 0x10b981, 0xec4899];

      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 80;
        posArray[i + 1] = (Math.random() - 0.5) * 80;
        posArray[i + 2] = (Math.random() - 0.5) * 80;
        const c = palette[Math.floor(Math.random() * palette.length)];
        colorsArray[i] = ((c >> 16) & 255) / 255;
        colorsArray[i + 1] = ((c >> 8) & 255) / 255;
        colorsArray[i + 2] = (c & 255) / 255;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      const material = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.NormalBlending
      });
      const particlesMesh = new THREE.Points(geometry, material);
      scene.add(particlesMesh);

      const lineColors = [0xf59e0b, 0x3b82f6, 0x10b981];
      const lines: THREE.Line[] = [];
      for (let i = 0; i < 80; i++) {
        const lc = lineColors[i % lineColors.length];
        const lineMat = new THREE.LineBasicMaterial({
          color: lc,
          transparent: true,
          opacity: 0.04 + Math.random() * 0.04
        });
        const pts = [];
        for (let j = 0; j < 2; j++) {
          const idx = Math.floor(Math.random() * particlesCount);
          pts.push(new THREE.Vector3(posArray[idx * 3], posArray[idx * 3 + 1], posArray[idx * 3 + 2]));
        }
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(lineGeom, lineMat);
        scene.add(line);
        lines.push(line);
      }

      const orbs: THREE.Mesh[] = [];
      const orbColors = [0xf59e0b, 0x3b82f6, 0x10b981, 0xec4899];
      for (let r = 0; r < 6; r++) {
        const og = new THREE.SphereGeometry(1.5 + r * 0.8, 32, 32);
        const om = new THREE.MeshBasicMaterial({
          color: orbColors[r % orbColors.length],
          transparent: true,
          opacity: 0.03 + r * 0.01
        });
        const orb = new THREE.Mesh(og, om);
        orb.position.x = (Math.random() - 0.5) * 40;
        orb.position.y = (Math.random() - 0.5) * 40;
        orb.position.z = (Math.random() - 0.5) * 20;
        scene.add(orb);
        orbs.push(orb);
      }

      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.002;
        particlesMesh.rotation.y += 0.0002;
        particlesMesh.rotation.x += 0.0001;
        orbs.forEach((orb, i) => {
          orb.position.y += Math.sin(t + i * 0.5) * 0.01;
          orb.position.x += Math.cos(t + i * 0.3) * 0.01;
          orb.rotation.x += 0.001;
          orb.rotation.y += 0.0008;
        });
        lines.forEach((line, i) => {
          line.rotation.y += 0.00005 * (i % 3 === 0 ? 1 : -1);
        });
        renderer.render(scene, camera);
      };
      animate();

      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        lines.forEach(l => { l.geometry.dispose(); (l.material as THREE.Material).dispose(); });
        orbs.forEach(o => { o.geometry.dispose(); (o.material as THREE.Material).dispose(); });
        if (canvas.parentElement) canvas.remove();
      };
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isDark]);

  /* ── Handlers ── */
  const handleRoleClick = useCallback((roleId: string) => {
    setOpenMenuId((prev) => (prev === roleId ? null : roleId));
    setActiveRoleId(roleId);
    setActiveDutyIndex(null);
    setCurrentPage('role');
    setIsMobileMenuOpen(false);
    setShowRegistration(false);
    setShowLogin(false);
    setShowDashboard(false);
    setShowRoleSelection(false);
  }, []);

  const handleDutyClick = useCallback((dutyIndex: number) => {
    setActiveDutyIndex((prev) => (prev === dutyIndex ? null : dutyIndex));
  }, []);

  const handleMakeEnquiry = useCallback(() => {
    setContentExiting(true);
    setTimeout(() => {
      setShowRegistration(true);
      setContentExiting(false);
    }, 500);
  }, []);

  const handleGoBack = useCallback(() => {
    setShowRegistration(false);
    setShowLogin(false);
    setShowDashboard(false);
    setShowRoleSelection(false);
    setUser(null);
    setCurrentPage('home');
  }, []);

  const handleInternalOperations = useCallback(() => {
    setContentExiting(true);
    setTimeout(() => {
      setShowRegistration(false);
      setShowLogin(true);
      setContentExiting(false);
    }, 500);
  }, []);

  const handleLoginSuccess = useCallback((userData: User) => {
    setUser(userData);
    if (userData.role_id) {
      setShowDashboard(true);
      setShowLogin(false);
      setShowRegistration(false);
      setShowRoleSelection(false);
    } else {
      setShowRoleSelection(true);
      setShowLogin(false);
    }
  }, []);

  const handleRoleSelected = useCallback((roleId: string, dutyIndex: number | null) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, role_id: roleId, duty_index: dutyIndex };
    });
    setShowRoleSelection(false);
    setShowDashboard(true);
  }, []);

  const handleLogout = useCallback(() => {
    setShowDashboard(false);
    setShowRoleSelection(false);
    setUser(null);
    setShowLogin(true);
  }, []);

  const activeRole = roles.find((r) => r.id === activeRoleId) ?? null;
  const activeColors = activeRole ? roleColorMap[activeRole.color] : null;

  /* ── RENDER ────────────────────────────────── */

  // 🔁 EARLY RETURNS – remove sidebar for Login / Registration / Dashboard / RoleSelection
  if (showDashboard && user) {
    return (
      <Dashboard
        fullName={user.full_name}
        roleId={user.role_id!}
        dutyIndex={user.duty_index ?? null}
        onLogout={handleLogout}
      />
    );
  }

  if (showRoleSelection && user) {
    return (
      <RoleSelection
        staffId={user.staff_id}
        onRoleSelected={handleRoleSelected}
        onCancel={() => {
          setShowRoleSelection(false);
          setShowLogin(true);
          setUser(null);
        }}
      />
    );
  }

  // 🆕 Early return for Login – no sidebar, no header, just the form
  if (showLogin) {
    return <Login onGoBack={handleGoBack} onLoginSuccess={handleLoginSuccess} />;
  }

  // 🆕 Early return for Registration – no sidebar, no header, just the form
  if (showRegistration) {
    return <Registration onGoBack={handleGoBack} onGoToLogin={handleInternalOperations} />;
  }

  /* ── Otherwise, show the full layout with sidebar ── */

  const sidebarBg = isDark ? 'bg-[#0a0f1c]' : 'bg-white';
  const sidebarBorder = isDark ? 'border-white/10' : 'border-slate-200';
  const sidebarText = isDark ? 'text-white' : 'text-slate-900';
  const sidebarMuted = isDark ? 'text-zinc-400' : 'text-slate-500';
  const sidebarNavText = isDark ? 'text-zinc-300' : 'text-slate-700';
  const sidebarNavHover = isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100';
  const sidebarDivider = isDark ? 'text-zinc-500' : 'text-slate-500';
  const sidebarDividerBorder = isDark ? 'border-white/5' : 'border-slate-200';
  const mobileHeaderBg = isDark ? 'bg-[#030712]/95' : 'bg-white/95';
  const mobileHeaderBorder = isDark ? 'border-white/10' : 'border-slate-200';
  const mobileHeaderText = isDark ? 'text-white' : 'text-slate-900';
  const footerBg = isDark ? 'bg-white/5' : 'bg-slate-100';
  const footerText = isDark ? 'text-zinc-400' : 'text-slate-600';

  return (
    <div className={`h-screen overflow-hidden font-sans ${isDark ? 'dark bg-[#030712] text-white' : 'light bg-[#f8fafc] text-slate-900'}`}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contentExit {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(-100px) scale(0.95); }
        }
        .content-enter { animation: slideUpFade 0.35s cubic-bezier(0.4,0,0.2,1); }
        .content-exit { animation: contentExit 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {/* ── 3D Background Container ── */}
      <div id="bg-canvas-container" 
           className="fixed inset-0 z-0 pointer-events-none" 
           aria-hidden 
           style={{ background: isDark ? '#030712' : '#f8fafc' }} />

      {/* Mobile Header */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-50 ${mobileHeaderBg} backdrop-blur-md border-b ${mobileHeaderBorder} flex items-center justify-between px-4 py-2.5`}>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation" className={`flex flex-col gap-1.5 ${mobileHeaderText}`}>
          <span className="block w-5 h-0.5 bg-current" /><span className="block w-5 h-0.5 bg-current" /><span className="block w-5 h-0.5 bg-current" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold text-xs">AI</div>
          <span className={`font-semibold text-base tracking-tight ${mobileHeaderText}`}>NUCAICE</span>
        </div>
        <div className="text-[10px] text-cyan-400 font-mono">FUDMA</div>
      </header>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <nav className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r ${sidebarBg} ${sidebarBorder} transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          style={{ width: '240px' }}>

          <div className={`p-4 border-b ${sidebarBorder} flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-400 text-sm bg-gradient-to-br from-cyan-400/20 to-blue-600/20" style={{ boxShadow: '0 0 18px rgba(34,211,238,0.4)' }}>
                  AI
                </div>
                <div className="absolute inset-0 bg-cyan-400/15 blur-lg rounded-2xl -z-10" />
              </div>
              <div>
                <h2 className={`text-lg font-bold tracking-tighter ${sidebarText}`}>NUCAICE</h2>
                <p className={`text-[10px] ${sidebarMuted}`}>AI Centre of Excellence</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-mono tracking-widest border border-cyan-500/30 text-cyan-400 rounded-full">FUDMA CHAPTER</span>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto p-3 space-y-4 ${isDark ? 'sidebar-scroll' : ''}`} style={{ scrollbarWidth: 'thin' }}>
            <div>
              <div className={`text-[16px] tracking-[6px] ${sidebarDivider} font-semibold uppercase mb-2 pb-1 border-b ${sidebarDividerBorder}`}>STAFF ROLES</div>
              <div className="space-y-1">
                {roles.map((role) => {
                  const colors = roleColorMap[role.color];
                  const isActive = activeRoleId === role.id && currentPage === 'role';
                  const isOpen = openMenuId === role.id;
                  return (
                    <div key={role.id}>
                      <button
                        onClick={() => handleRoleClick(role.id)}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 hover:brightness-110 text-left ${isActive ? colors.sidebarActive : sidebarNavHover}`}
                      >
                        <span className="text-sm flex-shrink-0">{role.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[10px] font-semibold leading-tight truncate ${sidebarNavText}`}>{role.title}</div>
                          <span className={`text-[16px] font-mono ${colors.text}`}>{role.shortCode}</span>
                        </div>
                        <span className={`text-sm flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} ${sidebarMuted}`}>›</span>
                      </button>

                      <AnimatedSubmenu open={isOpen}>
                        <ul className="ml-5 mt-0.5 space-y-0.5 pb-1">
                          {role.duties.map((duty, di) => (
                            <li key={di}>
                              <button
                                onClick={() => { setActiveRoleId(role.id); setCurrentPage('role'); setActiveDutyIndex(di); setIsMobileMenuOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 rounded-md text-[9px] transition-all hover:bg-white/5 ${colors.text} opacity-75 hover:opacity-100 flex items-center gap-1.5`}
                              >
                                <span className="font-mono opacity-50 text-[8px]">{duty.romanNumeral}.</span>
                                <span className="truncate">{duty.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </AnimatedSubmenu>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className={`text-[18px] tracking-[6px] ${sidebarDivider} font-semibold uppercase mb-2 pb-1 border-b ${sidebarDividerBorder}`}>ABOUT</div>
              <div className="space-y-0.5">
                {[
                  { id: 'home', label: '🏠 Home' },
                  { id: 'mission', label: '🎯 Mission & Vision' },
                  { id: 'internal', label: '⚙️ Internal Operations' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'internal') {
                        handleInternalOperations();
                      } else {
                        setCurrentPage(item.id as 'home' | 'mission');
                        setActiveRoleId(null);
                        setOpenMenuId(null);
                        setActiveDutyIndex(null);
                        setShowRegistration(false);
                        setShowLogin(false);
                        setShowDashboard(false);
                        setShowRoleSelection(false);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] transition-all ${sidebarNavHover} ${
                      (currentPage === item.id || (item.id === 'internal' && showLogin))
                        ? 'bg-white/10 text-cyan-400 font-semibold'
                        : sidebarNavText
                    }`}
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-3 border-t ${sidebarBorder} flex-shrink-0 space-y-2`}>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`w-full flex items-center gap-2 px-3 py-2 ${sidebarNavHover} rounded-lg text-[10px] transition-colors ${sidebarNavText}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <span>Toggle {isDark ? 'Light' : 'Dark'} Mode</span>
            </button>
            <div className={`${footerBg} p-2.5 rounded-xl`}>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">MU</div>
                <div>
                  <p className={`font-semibold text-[14px] ${sidebarText}`}>Muhammad A. Unwala</p>
                  <p className={`text-[9px] ${footerText}`}>Centre Programme Coordinator</p>
                </div>
              </div>
            </div>
            <p className={`text-[14px] text-center ${footerText}`}>© 2026 NUCAICE · FUDMA</p>
          </div>
        </nav>

        <main
          className="flex-1 h-screen overflow-hidden relative z-10 pt-12 md:pt-0 flex flex-col"
          style={{ marginLeft: '240px' }}
        >
          <div className="flex-1 overflow-hidden p-4 md:p-6 flex flex-col">
            {showLogin ? (
              <Login onGoBack={handleGoBack} onLoginSuccess={handleLoginSuccess} />
            ) : showRegistration ? (
              <Registration onGoBack={handleGoBack} onGoToLogin={handleInternalOperations} />
            ) : (
              <div className={contentExiting ? 'content-exit' : ''}>
                {currentPage === 'home' && (
                  <div key="home" className="content-enter h-full">
                    <HomeContent onMakeEnquiry={handleMakeEnquiry} onRoleClick={handleRoleClick} isDark={isDark} />
                  </div>
                )}
                {currentPage === 'mission' && (
                  <div key="mission" className="content-enter h-full">
                    <MissionContent isDark={isDark} />
                  </div>
                )}
                {currentPage === 'role' && activeRole && activeColors && (
                  <div key={`role-${activeRole.id}`} className="content-enter h-full">
                    <RoleContent
                      activeRole={activeRole}
                      activeColors={activeColors}
                      activeDutyIndex={activeDutyIndex}
                      onDutyClick={handleDutyClick}
                      onSetActiveDutyIndex={setActiveDutyIndex}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}