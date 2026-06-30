'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface RegistrationProps {
  onGoBack: () => void;
  onGoToLogin?: () => void;
}

export default function Registration({ onGoBack, onGoToLogin }: RegistrationProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const borderCanvasRef = useRef<HTMLCanvasElement>(null);
  const fudmaLogoRef = useRef<HTMLDivElement>(null);
  const aiLogoRef = useRef<HTMLDivElement>(null);
  const [staffId, setStaffId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [encryptedKey, setEncryptedKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  /* ── Three.js Background ── */
  useEffect(() => {
    if (!bgCanvasRef.current) return;
    const canvas = bgCanvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 30;

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
    const material = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
    const particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);

    const lineColors = [0x22d3ee, 0x818cf8, 0x34d399];
    const lines: THREE.Line[] = [];
    for (let i = 0; i < 120; i++) {
      const lc = lineColors[i % lineColors.length];
      const lineMat = new THREE.LineBasicMaterial({ color: lc, transparent: true, opacity: 0.06 + Math.random() * 0.06 });
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
      const tm = new THREE.MeshBasicMaterial({ color: ringColors[r % ringColors.length], transparent: true, opacity: 0.1 + r * 0.02 });
      const torus = new THREE.Mesh(tg, tm);
      torus.rotation.x = Math.random() * Math.PI;
      torus.rotation.y = Math.random() * Math.PI;
      scene.add(torus);
      rings.push(torus);
    }

    let animId: number;
    let t = 0;
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
      lines.forEach((line, i) => { line.rotation.y += 0.0001 * (i % 3 === 0 ? 1 : -1); });
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  /* ── Countdown ── */
  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showSuccess && countdown === 0) {
      if (onGoToLogin) onGoToLogin();
    }
  }, [showSuccess, countdown, onGoToLogin]);

  /* ── FUDMA Logo ── */
  useEffect(() => {
    if (!fudmaLogoRef.current) return;
    const container = fudmaLogoRef.current;
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
    let blinkTime = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      blinkTime += 0.016;
      const cycle = (blinkTime % 6) / 6;
      let opacity = 1;
      if (cycle < 0.33) opacity = 1;
      else if (cycle < 0.5) opacity = 1 - (cycle - 0.33) / 0.17;
      else if (cycle < 0.83) opacity = 0;
      else opacity = (cycle - 0.83) / 0.17;
      material.opacity = opacity;
      logoMesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ── AI Logo ── */
  useEffect(() => {
    if (!aiLogoRef.current) return;
    const container = aiLogoRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const canvas2d = document.createElement('canvas');
    canvas2d.width = 256;
    canvas2d.height = 256;
    const ctx2d = canvas2d.getContext('2d');
    if (ctx2d) {
      ctx2d.fillStyle = 'transparent';
      ctx2d.fillRect(0, 0, 256, 256);
      ctx2d.fillStyle = '#22d3ee';
      ctx2d.font = 'bold 120px Arial';
      ctx2d.textAlign = 'center';
      ctx2d.textBaseline = 'middle';
      ctx2d.fillText('AI', 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas2d);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const logoMesh = new THREE.Mesh(geometry, material);
    scene.add(logoMesh);

    let animId: number;
    let blinkTime = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      blinkTime += 0.016;
      const cycle = ((blinkTime + 3) % 6) / 6;
      let opacity = 1;
      if (cycle < 0.33) opacity = 1;
      else if (cycle < 0.5) opacity = 1 - (cycle - 0.33) / 0.17;
      else if (cycle < 0.83) opacity = 0;
      else opacity = (cycle - 0.83) / 0.17;
      material.opacity = opacity;
      logoMesh.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  /* ── 3D Border ── */
  useEffect(() => {
    if (!borderCanvasRef.current) return;
    const canvas = borderCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    let offset = 0;
    let animId: number;
    let time = 0;

    const colors = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];

    const drawBorder = () => {
      animId = requestAnimationFrame(drawBorder);
      time += 0.016;
      const cycleDuration = 6;
      const cyclePosition = (time % cycleDuration) / cycleDuration;
      let speedMultiplier: number;
      if (cyclePosition < 0.5) {
        const fastPhase = cyclePosition * 2;
        speedMultiplier = 3 + Math.sin(fastPhase * Math.PI) * 2;
      } else {
        const slowPhase = (cyclePosition - 0.5) * 2;
        speedMultiplier = 0.5 + Math.sin(slowPhase * Math.PI) * 0.3;
      }
      offset += 2 * speedMultiplier;

      ctx.clearRect(0, 0, W, H);
      const borderWidth = 3;
      const cornerRadius = 16;
      const perimeter = 2 * (W + H) - 8 * cornerRadius + 2 * Math.PI * cornerRadius;
      const segmentLength = perimeter / colors.length;

      ctx.lineWidth = borderWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < colors.length; i++) {
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        colors.forEach((color, idx) => {
          gradient.addColorStop((idx / colors.length + offset / perimeter) % 1, color);
        });
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(W - cornerRadius, 0);
        ctx.arcTo(W, 0, W, cornerRadius, cornerRadius);
        ctx.lineTo(W, H - cornerRadius);
        ctx.arcTo(W, H, W - cornerRadius, H, cornerRadius);
        ctx.lineTo(cornerRadius, H);
        ctx.arcTo(0, H, 0, H - cornerRadius, cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        ctx.closePath();
        ctx.setLineDash([segmentLength * 0.6, segmentLength * 0.4]);
        ctx.lineDashOffset = -offset;
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    drawBorder();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ─── MAIN HANDLER ───
  const handleEncrypt = async () => {
    if (!staffId || !fullName || !email || !phone || !encryptedKey) {
      setError('Please fill in all fields');
      return;
    }

    // Staff ID validation
    if (!/^PS\d{1,5}$/.test(staffId)) {
      setError('Staff ID must start with "PS" followed by 1 to 5 digits (e.g. PS12, PS123, PS1234, PS12345)');
      return;
    }

    const allowedDomains = ['gmail.com', 'yahoo.com', 'icloud.com', 'fudutsinma.edu.ng'];
    const emailDomain = email.split('@')[1];
    if (!emailDomain || !allowedDomains.includes(emailDomain.toLowerCase())) {
      setError('Email must be from @gmail.com, @yahoo.com, @icloud.com, or @fudutsinma.edu.ng');
      return;
    }

    if (!/^\d{11}$/.test(phone)) {
      setError('Phone number must be exactly 11 digits and contain only numbers');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiBase}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: staffId,
          full_name: fullName,
          email: email,
          phone: phone,
          encrypted_key: encryptedKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  // ─── ENCRYPTED KEY INPUT HANDLER – now accepts any input ───
  const handleEncryptedKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEncryptedKey(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-sm">
      {/* Three.js Background */}
      <canvas ref={bgCanvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden />

      {/* Animated Border Container */}
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <canvas
          ref={borderCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ borderRadius: '16px' }}
        />

        {/* Form Content - Dark Background */}
        <div className="relative rounded-2xl p-4 sm:p-6 md:p-8 m-0.75 bg-[#0a0f1c]/90 backdrop-blur-sm border border-white/10">
          {showSuccess ? (
            <div className="text-center bg-green-900/40 border border-green-500/50 rounded-2xl p-6 sm:p-8 max-w-md mx-auto backdrop-blur-sm">
              <div className="text-4xl sm:text-5xl mb-4">✅</div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-2">Encrypted Successfully</h3>
              <p className="text-zinc-300 text-[14px] sm:text-[15px] leading-relaxed mb-6">
                Your daily access key has been sent to your phone number via SMS, use that as your password.
              </p>
              <div className="text-zinc-400 text-sm mb-6">
                Redirecting to Login in <span className="text-green-400 font-bold text-lg">{countdown}</span> seconds...
              </div>
              <button
                onClick={() => onGoToLogin && onGoToLogin()}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-200"
              >
                ⚙️ Internal Operations
              </button>
            </div>
          ) : (
            <>
              {/* Header with Logos */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                <div
                  ref={fudmaLogoRef}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 border-2 border-green-500/50"
                  style={{ boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
                />
                <div className="text-center">
                  <p className="text-green-400 text-[11px] sm:text-[14px] md:text-[18px] font-bold tracking-widest uppercase leading-tight">FEDERAL UNIVERSITY DUTSINMA</p>
                  <h2 className="text-[22px] sm:text-[24px] md:text-[28px] font-bold text-white tracking-tight mt-0.5 sm:mt-1">NUCAICE</h2>
                  <p className="text-green-400 text-[13px] sm:text-[14px] md:text-[16px] font-semibold mt-0.5 sm:mt-1">Staff Registration Portal</p>
                </div>
                <div
                  ref={aiLogoRef}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/50 flex items-center justify-center"
                  style={{ boxShadow: '0 0 15px rgba(34,211,238,0.3)' }}
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-6 sm:gap-y-5">
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-green-400 text-[12px] sm:text-[14px] font-bold uppercase tracking-wider mb-1.5">Staff ID</label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white text-[13px] sm:text-[14px] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Enter Staff ID (e.g. PS12, PS123, PS12345)"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-[12px] sm:text-[14px] font-bold uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white text-[13px] sm:text-[14px] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Enter Email Address"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-[12px] sm:text-[14px] font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 11) setPhone(val);
                      }}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white text-[13px] sm:text-[14px] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Enter 11-digit Phone Number"
                      maxLength={11}
                    />
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-green-400 text-[12px] sm:text-[14px] font-bold uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white text-[13px] sm:text-[14px] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      placeholder="Enter Full Name"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-[12px] sm:text-[14px] font-bold uppercase tracking-wider mb-1.5">
                      Encrypted Key <span className="text-amber-400 text-[10px] sm:text-[12px]">(from CDO)</span>
                    </label>
                    <input
                      type="password"
                      value={encryptedKey}
                      onChange={handleEncryptedKeyChange}
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-white text-[13px] sm:text-[14px] placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono transition-all"
                      placeholder="Enter your encrypted key"
                    />
                    <p className="text-zinc-500 text-[10px] sm:text-[11px] mt-1">Use a valid key generated by the CDO Head.</p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-2.5 mt-4 sm:mt-5">
                  <p className="text-red-300 text-[12px] sm:text-[13px] font-bold">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <button
                  onClick={handleEncrypt}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30 text-[13px] sm:text-[14px] disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : '🔐 Encrypt & Register'}
                </button>
                <button
                  onClick={onGoBack}
                  className="w-full sm:w-auto bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg transition-all duration-200 hover:scale-[1.02] text-[13px] sm:text-[14px]"
                >
                  ← Cancel / Go Back
                </button>
              </div>

              {/* Footer */}
              <p className="text-center text-zinc-500 text-[10px] sm:text-[11px] mt-4 sm:mt-6">
                © 2026 NUCAICE · FUDMA · Secure Registration Portal
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}