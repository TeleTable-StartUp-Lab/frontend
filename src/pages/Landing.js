import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Wifi, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'TeleTable - Home';
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">System Online v2.0</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Medical Care
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              Autonomous transport system for the modern Care Center. Efficient, smart, and always there when you need it.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? "/dashboard" : "/login"}
                className="group relative px-8 py-4 bg-primary text-dark-900 font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-[100px] opacity-20" />
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <img
                  src="/favicon.svg"
                  alt="TeleTable"
                  className="w-72 sm:w-80 md:w-96 lg:w-[420px] drop-shadow-[0_0_40px_rgba(0,240,255,0.5)]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-primary font-medium tracking-wider uppercase">Features</h2>
          <p className="text-4xl font-bold text-white">Smart Technology Core</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Autonomous Navigation",
              desc: "Advanced algorithms allow TeleTable to navigate complex environments safely.",
              color: "text-primary"
            },
            {
              icon: Wifi,
              title: "Real-time Telemetry",
              desc: "Monitor position, battery, and status in real-time through our low-latency dashboard.",
              color: "text-secondary"
            },
            {
              icon: Zap,
              title: "Smart Power",
              desc: "Hot-Swappable battery allows for high uptime and availability.",
              color: "text-warning"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-dark-800 flex items-center justify-center mb-6 border border-white/5">
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default Landing;