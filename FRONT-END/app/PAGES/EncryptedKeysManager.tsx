'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EncryptedKey {
  id: number;
  encrypted_key: string;
  valid: boolean;
  used_by: string | null;
  used_time: string | null;
  generated_time: string;
}

interface Props {
  staffId: string;
}

export default function EncryptedKeysManager({ staffId }: Props) {
  const [keys, setKeys] = useState<EncryptedKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // ── Fetch keys inside useEffect ──
  useEffect(() => {
    const fetchKeys = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/encrypted-keys?staff_id=${staffId}`);
        if (!res.ok) throw new Error('Failed to fetch keys');
        const data = await res.json();
        setKeys(data);
      } catch {
        setError('Could not load encrypted keys.');
      } finally {
        setLoading(false);
      }
    };
    fetchKeys();
  }, [apiBase, staffId]);

  // ── Cleanup cooldown interval on unmount ──
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Handle generate ──
  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError('');
    startAnimation();

    try {
      const res = await fetch(`${apiBase}/api/generate-encrypted-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId }),
      });
      const data = await res.json();

      if (!res.ok) {
        // ── Handle 429 (cooldown) ──
        if (res.status === 429) {
          // The backend returns an object with seconds_remaining
          const remaining = data.seconds_remaining || data.detail?.seconds_remaining || 18000;
          setCooldown(remaining);
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          setError(`Please wait ${minutes}:${seconds.toString().padStart(2, '0')} before generating again.`);
          startCooldownTimer(remaining);
        } else {
          // Extract a readable error message
          let msg = 'Generation failed';
          if (typeof data.detail === 'string') {
            msg = data.detail;
          } else if (typeof data.detail === 'object') {
            msg = data.detail.message || data.detail.error || JSON.stringify(data.detail);
          }
          throw new Error(msg);
        }
      } else {
        // ── Success: refresh keys and start cooldown ──
        await refreshKeys();
        alert(`Generated ${data.keys.length} new encrypted keys!`);
        // ── START COOLDOWN (5 hours = 18000 seconds) ──
        setCooldown(18000);
        startCooldownTimer(18000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      setError(message);
    } finally {
      setIsGenerating(false);
      stopAnimation();
    }
  };

  const refreshKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/encrypted-keys?staff_id=${staffId}`);
      if (!res.ok) throw new Error('Failed to fetch keys');
      const data = await res.json();
      setKeys(data);
    } catch {
      setError('Could not refresh keys.');
    } finally {
      setLoading(false);
    }
  };

  const startCooldownTimer = (seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Three.js animation ──
  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5, roughness: 0.2 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0x404040);
    scene.add(ambient);

    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      particlePos[i] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.05, transparent: true });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const animate = () => {
      if (!sceneRef.current) return;
      mesh.rotation.x += 0.02;
      mesh.rotation.y += 0.03;
      particles.rotation.y += 0.001;
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const stopAnimation = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (sceneRef.current) {
      sceneRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-amber-300">🔑 Encrypted Keys Management</h3>
        <div className="flex items-center gap-4">
          {cooldown !== null && cooldown > 0 && (
            <span className="text-red-400 text-sm">
              Cooldown: {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (cooldown !== null && cooldown > 0)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              isGenerating || (cooldown !== null && cooldown > 0)
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30'
            }`}
          >
            {isGenerating ? 'Generating...' : '🔄 Generate 10 Keys'}
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="mb-4 rounded-lg overflow-hidden border border-amber-400/30" style={{ height: '200px' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-400/40 rounded-lg px-4 py-2.5 mb-4">
          <p className="text-red-300 text-sm font-bold">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-zinc-400">Loading keys...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-left text-zinc-400">
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Encrypted Key</th>
                <th className="px-4 py-2 font-medium">Valid</th>
                <th className="px-4 py-2 font-medium">Used By</th>
                <th className="px-4 py-2 font-medium">Used Time</th>
                <th className="px-4 py-2 font-medium">Generated</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-zinc-500 py-4">No keys generated yet.</td>
                </tr>
              ) : (
                keys.map((key, idx) => (
                  <tr key={key.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 text-zinc-400">{idx + 1}</td>
                    <td className="px-4 py-2 font-mono text-cyan-300">{key.encrypted_key}</td>
                    <td className="px-4 py-2">
                      {key.valid ? (
                        <span className="text-green-400 text-xl">✅</span>
                      ) : (
                        <span className="text-red-400 text-xl">❌</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{key.used_by || '—'}</td>
                    <td className="px-4 py-2 text-zinc-400">
                      {key.used_time ? new Date(key.used_time).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-400">
                      {new Date(key.generated_time).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}