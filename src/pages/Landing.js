import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Battery, Wifi, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
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
                Office Logistics
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
              Autonomous transport system for the modern workplace. Efficient, smart, and always there when you need it.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group relative px-8 py-4 bg-primary text-dark-900 font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.4)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <button className="px-8 py-4 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                View Documentation
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full aspect-square max-w-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-[100px] opacity-20 animate-pulse" />
              <img
                src="/teletable_hero_tech.webp"
                alt="TeleTable Hero"
                className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              />

              {/* Floating Stats Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 p-4 glass-panel rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Battery className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Battery Status</div>
                    <div className="text-lg font-bold text-white">98%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-0 p-4 glass-panel rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Wifi className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Signal Strength</div>
                    <div className="text-lg font-bold text-white">Excellent</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-primary font-medium tracking-wider uppercase">Features</h2>
          <p className="text-4xl font-bold text-white">Smart Technology Core</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Truck,
              title: "Autonomous Navigation",
              desc: "Advanced LIDAR mapping allows TeleTable to navigate complex office environments safely.",
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
              desc: "Automatic return-to-base functionality ensures 99.9% uptime availability.",
              color: "text-warning"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-xl bg-dark-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-primary font-medium tracking-wider uppercase">The Team</h2>
          <p className="text-4xl font-bold text-white">Built by Engineers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((member) => (
            <div key={member} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative p-6 rounded-2xl bg-dark-800 border border-white/5 space-y-4">
                <div className="h-48 rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-20 h-20 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Team Member {member}</h3>
                  <p className="text-primary">Full Stack Engineer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple placeholder icon for team members
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default Landing;