import { motion } from 'motion/react';

export function AnimatedBackground() {
  const sqlKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'GROUP BY',
    'ORDER BY',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'COUNT',
    'SUM',
    'AVG',
    'MAX',
    'MIN',
  ];

  const getRandomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  const getRandomDuration = () => 15 + Math.random() * 10;

  return (
    <>
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #bc3a08 0%, transparent 70%)' }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #bc3a08 0%, transparent 70%)' }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {sqlKeywords.map((keyword, index) => {
        const startPos = getRandomPosition();
        const duration = getRandomDuration();

        return (
          <motion.div
            key={index}
            className="absolute text-[#bc3a08] opacity-5 pointer-events-none select-none"
            style={{
              left: `${startPos.x}%`,
              top: `${startPos.y}%`,
              fontSize: `${12 + Math.random() * 16}px`,
              fontFamily: 'monospace',
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.05, 0.08, 0.05, 0],
              y: [-20, -100],
              x: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear',
            }}
          >
            {keyword}
          </motion.div>
        );
      })}

      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#bc3a08"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 0,50 Q 200,100 400,50 T 800,50"
          fill="none"
          stroke="#bc3a08"
          strokeWidth="1"
          opacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.1, 0] }}
          transition={{
            pathLength: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        <motion.path
          d="M 1200,200 Q 1000,300 800,200 T 400,200"
          fill="none"
          stroke="#bc3a08"
          strokeWidth="1"
          opacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.1, 0] }}
          transition={{
            pathLength: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 },
            opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
        />

        <motion.path
          d="M 600,600 Q 400,500 200,600 T -200,600"
          fill="none"
          stroke="#bc3a08"
          strokeWidth="1"
          opacity="0.1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.1, 0] }}
          transition={{
            pathLength: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 },
            opacity: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 },
          }}
        />
      </svg>

      <motion.div
        className="absolute top-1/3 left-[10%] opacity-5 pointer-events-none"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <rect
            x="10"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke="#bc3a08"
            strokeWidth="2"
          />
          <line x1="10" y1="30" x2="70" y2="30" stroke="#bc3a08" strokeWidth="2" />
          <line x1="10" y1="45" x2="70" y2="45" stroke="#bc3a08" strokeWidth="1" />
          <line x1="10" y1="55" x2="70" y2="55" stroke="#bc3a08" strokeWidth="1" />
          <line x1="35" y1="10" x2="35" y2="70" stroke="#bc3a08" strokeWidth="1" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-[15%] opacity-5 pointer-events-none"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <rect
            x="10"
            y="10"
            width="60"
            height="60"
            fill="none"
            stroke="#bc3a08"
            strokeWidth="2"
          />
          <line x1="10" y1="30" x2="70" y2="30" stroke="#bc3a08" strokeWidth="2" />
          <line x1="10" y1="45" x2="70" y2="45" stroke="#bc3a08" strokeWidth="1" />
          <line x1="10" y1="55" x2="70" y2="55" stroke="#bc3a08" strokeWidth="1" />
          <line x1="35" y1="10" x2="35" y2="70" stroke="#bc3a08" strokeWidth="1" />
        </svg>
      </motion.div>

      {Array.from({ length: 20 }).map((_, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-1 h-1 bg-[#bc3a08] rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}