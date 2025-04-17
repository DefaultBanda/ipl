import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Pause, Play, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const BouncingBall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gravity, setGravity] = useState(9.8);
  const [elasticity, setElasticity] = useState(0.7);
  const [ballSize, setBallSize] = useState(20);
  const [initialVelocity, setInitialVelocity] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const ballRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  });
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const canvasWidth = 800;
  const canvasHeight = 400;
  const containerRadius = Math.min(canvasWidth, canvasHeight) / 2 - 20;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  const resetSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const angle = Math.random() * Math.PI * 2;
    ballRef.current = {
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * initialVelocity,
      vy: Math.sin(angle) * initialVelocity
    };
    
    lastTimeRef.current = 0;
    
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => {
      if (prev) {
        animationRef.current = requestAnimationFrame(animate);
        return false;
      } else {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return true;
      }
    });
  };

  const drawContainer = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, containerRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    
    const gradient = ctx.createRadialGradient(
      x - ballSize / 3, y - ballSize / 3, ballSize / 10,
      x, y, ballSize
    );
    gradient.addColorStop(0, '#60a5fa');
    gradient.addColorStop(1, '#3b82f6');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, ballSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(x - ballSize / 3, y - ballSize / 3, ballSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  const drawInfo = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px sans-serif';
    
    const infoX = 20;
    const infoY = 30;
    const lineHeight = 20;
    
    ctx.fillText(`Ball Size: ${ballSize.toFixed(0)} px`, infoX, infoY);
    ctx.fillText(`Velocity: ${initialVelocity.toFixed(1)} m/s`, infoX, infoY + lineHeight);
    ctx.fillText(`Elasticity: ${elasticity.toFixed(2)}`, infoX, infoY + lineHeight * 2);
    ctx.fillText(`Gravity: ${gravity.toFixed(1)} m/s²`, infoX, infoY + lineHeight * 3);
    
    ctx.restore();
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 16;
    lastTimeRef.current = timestamp;
    
    ballRef.current.vy += gravity * 0.02 * deltaTime;
    
    ballRef.current.x += ballRef.current.vx * deltaTime;
    ballRef.current.y += ballRef.current.vy * deltaTime;
    
    const dx = ballRef.current.x - centerX;
    const dy = ballRef.current.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance + ballSize > containerRadius) {
      const nx = dx / distance;
      const ny = dy / distance;
      
      const dotProduct = ballRef.current.vx * nx + ballRef.current.vy * ny;
      
      ballRef.current.vx -= 2 * dotProduct * nx * elasticity;
      ballRef.current.vy -= 2 * dotProduct * ny * elasticity;
      
      const correctionDistance = containerRadius - ballSize;
      ballRef.current.x = centerX + nx * correctionDistance;
      ballRef.current.y = centerY + ny * correctionDistance;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawContainer(ctx);
    drawBall(ctx, ballRef.current.x, ballRef.current.y);
    drawInfo(ctx);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    resetSimulation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ballSize, initialVelocity, elasticity, gravity]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-green-500">Bouncing Ball Simulator</h1>
        </div>
        <Toggle
          label="Advanced Options"
          checked={showAdvanced}
          onChange={setShowAdvanced}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Parameters</h2>
            <Slider
              label="Gravity (m/s²)"
              value={gravity}
              onChange={setGravity}
              min={1}
              max={20}
              step={0.1}
            />
            <Slider
              label="Elasticity"
              value={elasticity}
              onChange={setElasticity}
              min={0}
              max={1}
              step={0.01}
            />
            <Slider
              label="Ball Size (px)"
              value={ballSize}
              onChange={setBallSize}
              min={5}
              max={50}
              step={1}
            />
            <Slider
              label="Initial Velocity (m/s)"
              value={initialVelocity}
              onChange={setInitialVelocity}
              min={0}
              max={10}
              step={0.1}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {isPaused ? 'Start' : 'Pause'}
            </button>
            <button
              onClick={resetSimulation}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="aspect-[2/1] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
            />
          </div>

          {showAdvanced && (
            <div className="mt-6 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Physics Explained:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gravity: Earth's gravity is 9.8 m/s² (acceleration downward)</li>
                <li>Elasticity: Perfect elasticity (1.0) means no energy loss on collision</li>
                <li>Friction: Horizontal speed reduction when the ball contacts the ground</li>
                <li>Air Resistance: Drag force proportional to velocity squared (F = -kv²)</li>
                <li>Energy: Total energy = Potential energy (mgh) + Kinetic energy (½mv²)</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BouncingBall;