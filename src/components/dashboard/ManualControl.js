import React, { useState, useRef } from 'react';
import { Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ManualControl = () => {
  const [activeDirection, setActiveDirection] = useState('STOP');
  const constraintsRef = useRef(null);
  const lastCommandRef = useRef('stop');

  const handleCommand = (cmd) => {
    if (lastCommandRef.current !== cmd) {
      console.log(`Moving ${cmd}`);
      // Here we would send the command to the backend
      lastCommandRef.current = cmd;
      setActiveDirection(cmd.toUpperCase());
    }
  };

  const handleDrag = (event, info) => {
    const { x, y } = info.offset;
    const threshold = 10; // Sensitivity threshold

    // Determine primary direction based on largest offset
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
      // Deadzone
      return;
    }

    if (Math.abs(x) > Math.abs(y)) {
      // Horizontal movement
      if (x > threshold) handleCommand('right');
      else if (x < -threshold) handleCommand('left');
    } else {
      // Vertical movement
      if (y > threshold) handleCommand('backward');
      else if (y < -threshold) handleCommand('forward');
    }
  };

  const handleDragEnd = () => {
    handleCommand('stop');
    setActiveDirection('STOP');
  };

  return (
    <div className="glass-panel rounded-xl p-6 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-medium text-gray-400 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-secondary" />
          Manual Override
        </h3>
        <div className="px-3 py-1 rounded bg-dark-800 border border-white/10 text-xs font-mono text-primary">
          {activeDirection}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        {/* Joystick Base */}
        <div
          ref={constraintsRef}
          className="relative w-64 h-64 rounded-full bg-dark-800/50 border-2 border-white/5 shadow-inner flex items-center justify-center backdrop-blur-sm"
        >
          {/* Decorative Grid/Lines */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-4 right-4 h-px bg-white"></div>
            <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white"></div>
            <div className="absolute inset-12 border border-white/30 rounded-full"></div>
          </div>

          {/* Joystick Handle */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            dragSnapToOrigin
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 0.9 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20"></div>
          </motion.div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-500 font-mono">
        DRAG JOYSTICK TO MOVE
      </p>
    </div>
  );
};

export default ManualControl;