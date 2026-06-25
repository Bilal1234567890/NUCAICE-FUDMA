'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ── User type (shared between Login and page.tsx)
export interface User {
  staff_id: string;
  full_name: string;
  email: string;
  role_id?: string | null;
  duty_index?: number | null;
}

interface LoginProps {
  onGoBack: () => void;
  onLoginSuccess?: (user: User) => void;  // Now typed with User interface
}

export default function Login({ onGoBack, onLoginSuccess }: LoginProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const borderCanvasRef = useRef<HTMLCanvasElement>(null);
  const fudmaLogoRef = useRef<HTMLDivElement>(null);
  const aiLogoRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState('');
  const [dailyAccessKey, setDailyAccessKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  /* ── FUDMA Logo (Left) ── */
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
      if (cycle < 0.33) {
        opacity = 1;
      } else if (cycle < 0.5) {
        opacity = 1 - (cycle - 0.33) / 0.17;
      } else if (cycle < 0.83) {
        opacity = 0;
      } else {
        opacity = (cycle - 0.83) / 0.17;
      }
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  /* ── AI Logo (Right) ── */
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
      if (cycle < 0.33) {
        opacity = 1;
      } else if (cycle < 0.5) {
        opacity = 1 - (cycle - 0.33) / 0.17;
      } else if (cycle < 0.83) {
        opacity = 0;
      } else {
        opacity = (cycle - 0.83) / 0.17;
      }
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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  /* ── Animated 3D Border Canvas with Variable Speed ── */
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

  const handleAuthenticate = async () => {
    if (!userId || !dailyAccessKey) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // 👇 NEW: Use environment variable with fallback for local development
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiBase}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          daily_access_key: dailyAccessKey
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      alert('Authentication successful! Welcome ' + data.user.full_name);
      if (onLoginSuccess) {
        onLoginSuccess(data.user as User);   // Pass the user object with type
      } else {
        onGoBack();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during authentication';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Three.js Background */}
      <canvas ref={bgCanvasRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden />

      {/* Animated Border Container - Centered, Medium Size */}
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <canvas
          ref={borderCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ borderRadius: '16px' }}
        />

        {/* Form Content - Fully Transparent Background */}
        <div className="relative rounded-2xl p-8 m-0.75">
          {/* Header with Logos */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* FUDMA Logo - Left */}
            <div
              ref={fudmaLogoRef}
              className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-green-500/50"
              style={{ boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
            />

            {/* Center Text */}
            <div className="text-center">
              <p className="text-green-400 text-[18px] font-bold tracking-widest uppercase">FEDERAL UNIVERSITY DUTSINMA</p>
              <h2 className="text-[28px] font-bold text-white tracking-tight mt-1">NUCAICE</h2>
              <p className="text-green-400 text-[16px] font-semibold mt-1">Staff Login Portal</p>
            </div>

            {/* AI Logo - Right */}
            <div
              ref={aiLogoRef}
              className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400/50 flex items-center justify-center"
              style={{ boxShadow: '0 0 15px rgba(34,211,238,0.3)' }}
            />
          </div>

          {/* Form Fields - Centered 2 Fields */}
          <div className="max-w-md mx-auto space-y-5">
            <div>
              <label className="block text-green-500 text-[14px] font-bold uppercase tracking-wider mb-1.5">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-2.5 text-white text-[14px] placeholder-zinc-600 focus:outline-none transition-all green-shadow-input"
                placeholder="Enter User ID"
              />
            </div>

            <div>
              <label className="block text-green-500 text-[14px] font-bold uppercase tracking-wider mb-1.5">Daily Access Key</label>
              <input
                type="password"
                value={dailyAccessKey}
                onChange={(e) => setDailyAccessKey(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-2.5 text-white text-[14px] placeholder-zinc-600 focus:outline-none transition-all font-mono green-shadow-input"
                placeholder="Enter Daily Access Key"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg px-4 py-2.5 mt-5 max-w-md mx-auto">
              <p className="text-red-400 text-[13px] font-bold">{error}</p>
            </div>
          )}

          {/* Buttons - Authenticate Left, Back Right */}
          <div className="flex justify-between items-center mt-8 max-w-md mx-auto">
            <button
              onClick={handleAuthenticate}
              disabled={isSubmitting}
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 text-[14px] disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : '🔐 Authenticate'}
            </button>
            <button
              onClick={onGoBack}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-[1.02] text-[14px]"
            >
              ← Cancel / Go Back
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-zinc-500 text-[11px] mt-6">
            © 2026 NUCAICE · FUDMA · Secure Login Portal
          </p>
        </div>
      </div>
    </div>
  );
}