import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, CircleOff, Waves, Moon } from 'lucide-react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import ProjectileMotion from './components/ProjectileMotion';
import Pendulum from './components/Pendulum';
import BouncingBall from './components/BouncingBall';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              PhysicsLab
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {location.pathname === '/' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
                Interactive Physics Lab
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Explore physics concepts through fun, interactive simulations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimulationCard
                to="/projectile"
                icon={<BarChart2 className="w-8 h-8" />}
                title="Projectile Motion"
                description="Explore the physics of projectile motion with interactive controls"
                color="blue"
              />
              <SimulationCard
                to="/bouncing-ball"
                icon={<CircleOff className="w-8 h-8" />}
                title="Bouncing Ball"
                description="Simulate elastic collisions and energy conservation"
                color="green"
              />
              <SimulationCard
                to="/pendulum"
                icon={<Moon className="w-8 h-8" />}
                title="Pendulum"
                description="Explore simple pendulum physics and harmonic motion"
                color="purple"
              />
              <SimulationCard
                icon={<Waves className="w-8 h-8" />}
                title="Wave Simulator"
                description="Coming soon: Visualize wave interference and propagation"
                color="pink"
                disabled
              />
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Created with React, Tailwind CSS, and Framer Motion
            </p>
          </div>
        )}

        <Routes>
          <Route path="/projectile" element={<ProjectileMotion />} />
          <Route path="/bouncing-ball" element={<BouncingBall />} />
          <Route path="/pendulum" element={<Pendulum />} />
        </Routes>
      </main>
    </div>
  );
}

interface SimulationCardProps {
  to?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'pink';
  disabled?: boolean;
}

function SimulationCard({ to, icon, title, description, color, disabled }: SimulationCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  const buttonClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    pink: 'bg-gray-300',
  };

  const Card = motion.div;
  const content = (
    <Card
      whileHover={disabled ? {} : { y: -5 }}
      className={`p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 ${
        disabled ? 'opacity-75' : ''
      }`}
    >
      <div className={`w-16 h-16 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <button
        className={`px-4 py-2 rounded-lg text-white ${buttonClasses[color]} w-full`}
        disabled={disabled}
      >
        {disabled ? 'Coming Soon' : 'Play Now'}
      </button>
    </Card>
  );

  if (disabled || !to) {
    return content;
  }

  return <Link to={to}>{content}</Link>;
}

export default App;