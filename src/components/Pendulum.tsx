import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Pause, Play } from 'lucide-react';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const Pendulum: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(150);
  const [damping, setDamping] = useState(0.02);
  const [initialAngle, setInitialAngle] = useState(45);
  const [showTrace, setShowTrace] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const angleRef = useRef<number>(0);
  const angularVelocityRef = useRef<number>(0);
  const tracePointsRef = useRef<{ x: number; y: number }[]>([]);
  
  const canvasWidth = 800;
  const canvasHeight = 400;
  const originX = canvasWidth / 2;
  const originY = 50;
  
  const resetSimulation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Convert to radians
    angleRef.current = initialAngle * Math.PI / 180;
    angularVelocityRef.current = 0;
    tracePointsRef.current = [];
    
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => {
      if (prev) {
        // Resume animation
        animationRef.current = requestAnimationFrame(animate);
        return false;
      } else {
        // Pause animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return true;
      }
    });
  };

  const drawPendulum = (ctx: CanvasRenderingContext2D, angle: number) => {
    const bobX = originX + Math.sin(angle) * length;
    const bobY = originY + Math.cos(angle) * length;
    
    // Draw suspension point
    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.arc(originX, originY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rod
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    
    // Draw bob
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Add to trace points
    if (showTrace) {
      tracePointsRef.current.push({ x: bobX, y: bobY });
      // Limit number of trace points to prevent performance issues
      if (tracePointsRef.current.length > 500) {
        tracePointsRef.current.shift();
      }
    }
    
    return { x: bobX, y: bobY };
  };

  const drawTrace = (ctx: CanvasRenderingContext2D) => {
    if (!showTrace || tracePointsRef.current.length < 2) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const points = tracePointsRef.current;
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    ctx.restore();
  };

  const drawInfo = (ctx: CanvasRenderingContext2D, angle: number) => {
    ctx.save();
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px sans-serif';
    
    const infoX = 20;
    const infoY = 30;
    const lineHeight = 20;
    
    // Convert angle from radians to degrees for display
    const angleDegrees = (angle * 180 / Math.PI) % 360;
    
    ctx.fillText(`Angle: ${angleDegrees.toFixed(1)}°`, infoX, infoY);
    ctx.fillText(`Length: ${length.toFixed(0)} px`, infoX, infoY + lineHeight);
    ctx.fillText(`Damping: ${damping.toFixed(3)}`, infoX, infoY + lineHeight * 2);
    
    ctx.restore();
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Physics calculation
    const gravity = 9.8;
    const dt = 0.1; // Time step
    
    // Calculate angular acceleration
    const angularAcceleration = -(gravity / length) * Math.sin(angleRef.current);
    
    // Update angular velocity with damping
    angularVelocityRef.current += angularAcceleration * dt;
    angularVelocityRef.current *= (1 - damping);
    
    // Update angle
    angleRef.current += angularVelocityRef.current * dt;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw trace
    drawTrace(ctx);
    
    // Draw pendulum
    const bobPosition = drawPendulum(ctx, angleRef.current);
    
    // Draw info
    drawInfo(ctx, angleRef.current);
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    resetSimulation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [length, damping, initialAngle, showTrace]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Pendulum Simulator</h2>
        <div className="flex space-x-2">
          <button 
            onClick={togglePause}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button 
            onClick={resetSimulation}
            className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto bg-white rounded-md shadow-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Slider 
          label="Length (px)" 
          min={50} 
          max={300} 
          step={1} 
          value={length} 
          onChange={setLength} 
        />
        <Slider 
          label="Initial Angle (°)" 
          min={0} 
          max={90} 
          step={1} 
          value={initialAngle} 
          onChange={setInitialAngle} 
        />
        <Slider 
          label="Damping" 
          min={0} 
          max={0.1} 
          step={0.001} 
          value={damping} 
          onChange={setDamping} 
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Toggle 
          label="Show Trace" 
          checked={showTrace} 
          onChange={setShowTrace} 
        />
      </div>
    </div>
  );
};

export default Pendulum;