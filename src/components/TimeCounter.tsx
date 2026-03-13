"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeCounterProps {
  startDate: Date;
  label: string;
}

interface TimeUnits {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function TimeCounter({ startDate, label }: TimeCounterProps) {
  const [timeElapsed, setTimeElapsed] = useState<TimeUnits>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [prevTimeElapsed, setPrevTimeElapsed] = useState<TimeUnits>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(startDate);
      
      // Calculate total difference in milliseconds
      const diff = now.getTime() - start.getTime();
      
      // Calculate each unit
      let remaining = diff;
      
      // Years (approximate)
      const years = Math.floor(remaining / (365.25 * 24 * 60 * 60 * 1000));
      remaining -= years * (365.25 * 24 * 60 * 60 * 1000);
      
      // Months (approximate)
      const months = Math.floor(remaining / (30.44 * 24 * 60 * 60 * 1000));
      remaining -= months * (30.44 * 24 * 60 * 60 * 1000);
      
      // Days
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      remaining -= days * (24 * 60 * 60 * 1000);
      
      // Hours
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      remaining -= hours * (60 * 60 * 1000);
      
      // Minutes
      const minutes = Math.floor(remaining / (60 * 1000));
      remaining -= minutes * (60 * 1000);
      
      // Seconds
      const seconds = Math.floor(remaining / 1000);
      
      const newTime = {
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
      };

      // Save previous state before updating
      setTimeElapsed(prev => {
        setPrevTimeElapsed(prev);
        return newTime;
      });
    };

    // Calculate immediately
    calculateTime();
    
    // Update every second
    const interval = setInterval(calculateTime, 1000);
    
    return () => clearInterval(interval);
  }, [startDate]);

  const TimeUnit = ({ value, label, hasChanged }: { value: number; label: string; hasChanged: boolean }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md min-w-[70px] border border-white/50">
        {hasChanged ? (
          <motion.div
            key={value}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-2xl md:text-3xl font-bold text-primary"
          >
            {value.toString().padStart(2, '0')}
          </motion.div>
        ) : (
          <div className="text-2xl md:text-3xl font-bold text-primary">
            {value.toString().padStart(2, '0')}
          </div>
        )}
        <div className="text-xs text-gray-600 mt-0.5 font-medium">
          {label}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 relative">
      {/* Label */}
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-light text-gray-800 mb-2">
          {label}
        </h3>
        <p className="text-xs md:text-sm text-gray-600">
          Desde {new Date(startDate).toLocaleDateString('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Time Units Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        <TimeUnit 
          value={timeElapsed.years} 
          label="Anos" 
          hasChanged={timeElapsed.years !== prevTimeElapsed.years} 
        />
        <TimeUnit 
          value={timeElapsed.months} 
          label="Meses" 
          hasChanged={timeElapsed.months !== prevTimeElapsed.months} 
        />
        <TimeUnit 
          value={timeElapsed.days} 
          label="Dias" 
          hasChanged={timeElapsed.days !== prevTimeElapsed.days} 
        />
        <TimeUnit 
          value={timeElapsed.hours} 
          label="Horas" 
          hasChanged={timeElapsed.hours !== prevTimeElapsed.hours} 
        />
        <TimeUnit 
          value={timeElapsed.minutes} 
          label="Minutos" 
          hasChanged={timeElapsed.minutes !== prevTimeElapsed.minutes} 
        />
        <TimeUnit 
          value={timeElapsed.seconds} 
          label="Segundos" 
          hasChanged={timeElapsed.seconds !== prevTimeElapsed.seconds} 
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/5 rounded-full blur-xl"
            style={{
              width: Math.random() * 80 + 40,
              height: Math.random() * 80 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 15 - 7.5, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
