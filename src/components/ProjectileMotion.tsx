import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Pause, Play, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const ProjectileMotion: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(60);
  const [gravity, setGravity] = useState(9.8);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [time, setTime] = useState(0);
  const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const canvasWidth = 800;
  const canvasHeight = 400;
  const originX = 50;
  const originY = canvasHeight - 50;
  
  const resetSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTime(0);
    setTrajectory([]);
    startTimeRef.current = null;
    lastTimeRef.current = 0;
    setIsPaused(true);
  };

  const startSimulation = () => {
    setIsPaused(false);
    animationRef.current = requestAnimationFrame(animate);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawAngleArrow = (ctx: CanvasRenderingContext2D) => {
    const arrowLength = 50;
    const radians = angle * Math.PI / 180;
    const endX = originX + Math.cos(radians) * arrowLength;
    const endY = originY - Math.sin(radians) * arrowLength;
    
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const headLength = 10;
    const headAngle = 0.5;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headLength * Math.cos(radians - headAngle),
      endY + headLength * Math.sin(radians - headAngle)
    );
    ctx.lineTo(
      endX - headLength * Math.cos(radians + headAngle),
      endY + headLength * Math.sin(radians + headAngle)
    );
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.restore();
  };

  const drawTrajectory = (ctx: CanvasRenderingContext2D) => {
    if (trajectory.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trajectory[0].x, trajectory[0].y);
    
    for (let i = 1; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x, trajectory[i].y);
    }
    
    ctx.stroke();
    ctx.restore();
  };

  const drawProjectile = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    const newTime = time + deltaTime;
    setTime(newTime);
    
    const radians = angle * Math.PI / 180;
    const vx = velocity * Math.cos(radians);
    const vy = velocity * Math.sin(radians);
    
    const x = originX + vx * newTime;
    const y = originY - (vy * newTime - 0.5 * gravity * newTime * newTime);
    
    const newPoint = { x, y };
    setTrajectory(prev => [...prev, newPoint]);
    
    if (y >= canvasHeight || x >= canvasWidth) {
      setIsPaused(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx);
    drawAngleArrow(ctx);
    drawTrajectory(ctx);
    
    if (trajectory.length > 0) {
      const lastPoint = trajectory[trajectory.length - 1];
      drawProjectile(ctx, lastPoint.x, lastPoint.y);
    }
  }, [angle, velocity, gravity, trajectory]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const vx = velocity * Math.cos(angle * Math.PI / 180);
  const vy = velocity * Math.sin(angle * Math.PI / 180);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-blue-500">Projectile Motion Simulator</h1>
          </div>
          <Toggle
            label="Advanced Physics"
            checked={showAdvanced}
            onChange={setShowAdvanced}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl space-y-6">
              <h2 className="text-lg font-semibold">Basic Parameters</h2>
              
              <Slider
                label="Angle (°)"
                value={angle}
                onChange={setAngle}
                min={0}
                max={90}
                step={1}
              />
              
              <Slider
                label="Velocity (m/s)"
                value={velocity}
                onChange={setVelocity}
                min={0}
                max={100}
                step={1}
              />
              
              <Slider
                label="Gravity (m/s²)"
                value={gravity}
                onChange={setGravity}
                min={0}
                max={20}
                step={0.1}
              />

              <div className="flex gap-2">
                <button
                  onClick={isPaused ? startSimulation : resetSimulation}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isPaused ? 'Launch' : 'Reset'}
                </button>
              </div>

              {showAdvanced && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-2">Velocity Components</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Vx = {vx.toFixed(1)} m/s</span>
                      <span className="text-cyan-600">Vy = {vy.toFixed(1)} m/s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="aspect-[2/1] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                />
              </div>

              {showAdvanced && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Velocity Components</h3>
                  <div className="aspect-square max-w-[300px] mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <svg viewBox="0 0 200 200" className="w-full h-full">
                      <line x1="20" y1="180" x2="180" y2="180" stroke="#666" />
                      <line x1="20" y1="180" x2="20" y2="20" stroke="#666" />
                      <text x="190" y="180" className="text-sm">X</text>
                      <text x="20" y="10" className="text-sm">Y</text>
                      
                      <line
                        x1="20"
                        y1="180"
                        x2={20 + Math.cos(angle * Math.PI / 180) * 100}
                        y2={180 - Math.sin(angle * Math.PI / 180) * 100}
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      
                      <line
                        x1="20"
                        y1="180"
                        x2={20 + Math.cos(angle * Math.PI / 180) * 100}
                        y2="180"
                        stroke="#06b6d4"
                        strokeDasharray="4"
                      />
                      
                      <line
                        x1={20 + Math.cos(angle * Math.PI / 180) * 100}
                        y1="180"
                        x2={20 + Math.cos(angle * Math.PI / 180) * 100}
                        y2={180 - Math.sin(angle * Math.PI / 180) * 100}
                        stroke="#06b6d4"
                        strokeDasharray="4"
                      />
                    </svg>
                  </div>
                  <div className="mt-4 flex justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Total Velocity: {velocity.toFixed(1)} m/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span>Components: {vx.toFixed(1)} m/s, {vy.toFixed(1)} m/s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectileMotion;