
import React, { useState, useEffect } from 'react';

// --- Animation Definitions ---

type AnimationPose = {
  transform: string;
};

type AnimationFrame = {
  transform: string;
  opacity: number;
};

const dancePoses: AnimationPose[] = [
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(-4deg)' },
  { transform: 'rotate(0deg)' },
  { transform: 'rotate(4deg)' },
  { transform: 'rotate(0deg)' },
];

const tearFrames: AnimationFrame[] = [
  { transform: 'translateY(0px)', opacity: 1 },
  { transform: 'translateY(3px)', opacity: 0.8 },
  { transform: 'translateY(5px)', opacity: 0 },
  { transform: 'translateY(5px)', opacity: 0 },
];

const shakePoses: AnimationPose[] = [
  { transform: 'translateX(-1px) rotate(-1deg)' },
  { transform: 'translateX(1px) rotate(1deg)' },
];

type PlantAnimationProps = {
  moistureLevel: number;
};

export const PlantAnimation: React.FC<PlantAnimationProps> = ({ moistureLevel }) => {
  const [dancePoseIndex, setDancePoseIndex] = useState(0);
  const [tearFrameIndex, setTearFrameIndex] = useState(0);
  const [shakePoseIndex, setShakePoseIndex] = useState(0);
  const [sunRotation, setSunRotation] = useState(0);

  const getPlantState = () => {
    if (moistureLevel < 40) return 'droopy';
    if (moistureLevel > 85) return 'overwatered';
    return 'healthy';
  };

  const plantState = getPlantState();

  // --- Animation Effects ---

  useEffect(() => {
    let danceInterval: NodeJS.Timeout | undefined;
    if (plantState === 'healthy') {
      danceInterval = setInterval(() => {
        setDancePoseIndex(prevIndex => (prevIndex + 1) % dancePoses.length);
      }, 400);
    }
    return () => { if (danceInterval) clearInterval(danceInterval); };
  }, [plantState]);

  useEffect(() => {
    let tearInterval: NodeJS.Timeout | undefined;
    if (plantState === 'droopy') {
      tearInterval = setInterval(() => {
        setTearFrameIndex(prevIndex => (prevIndex + 1) % tearFrames.length);
      }, 450);
    }
    return () => { if (tearInterval) clearInterval(tearInterval); };
  }, [plantState]);

  useEffect(() => {
    let shakeInterval: NodeJS.Timeout | undefined;
    if (plantState === 'overwatered') {
      shakeInterval = setInterval(() => {
        setShakePoseIndex(prevIndex => (prevIndex + 1) % shakePoses.length);
      }, 120);
    }
    return () => { if (shakeInterval) clearInterval(shakeInterval); };
  }, [plantState]);

  useEffect(() => {
    const sunInterval = setInterval(() => {
      setSunRotation(prevRotation => (prevRotation + 1) % 360);
    }, 70); // Control rotation speed
    return () => clearInterval(sunInterval);
  }, []); // Runs continuously

  // --- Style Preparation ---
  const basePlantStyle: React.CSSProperties = {
    transition: 'transform 0.2s ease-in-out',
    transformOrigin: 'bottom center',
  };

  let activePlantStyle: React.CSSProperties = { ...basePlantStyle };

  if (plantState === 'healthy') {
    activePlantStyle.transform = dancePoses[dancePoseIndex].transform;
  } else if (plantState === 'droopy') {
    activePlantStyle.transform = 'rotate(2deg) scale(0.95)';
  } else if (plantState === 'overwatered') {
    activePlantStyle.transform = `translateY(2px) ${shakePoses[shakePoseIndex].transform}`;
  }
  
  const droopyLeafStyle: React.CSSProperties = plantState === 'droopy' ? { transform: 'rotate(20deg)', transformOrigin: 'bottom right' } : {};
  const droopyRightLeafStyle: React.CSSProperties = plantState === 'droopy' ? { transform: 'rotate(-20deg)', transformOrigin: 'bottom left' } : {};
  const droopyFlowerStyle: React.CSSProperties = plantState === 'droopy' ? { transform: 'rotate(15deg)', transformOrigin: 'center' } : {};
  
  const tearStyle: React.CSSProperties = {
    transition: 'transform 0.4s linear, opacity 0.5s ease-out',
    ...tearFrames[tearFrameIndex],
  };


  // --- Sub-Components ---
  const Face = () => {
    if (plantState === 'droopy') {
      return (
        <>
          <circle cx="46" cy="30" r="1.5" fill="black" />
          <circle cx="54" cy="30" r="1.5" fill="black" />
          <path d="M47 36 q3 -4 6 0" stroke="black" strokeWidth="1" fill="none" />
          <g style={tearStyle}>
            <path d="M45 33 q 1 2 0 3" stroke="#4682B4" strokeWidth="1.5" fill="none" />
            <path d="M55 33 q -1 2 0 3" stroke="#4682B4" strokeWidth="1.5" fill="none" />
          </g>
        </>
      );
    }
    if (plantState === 'overwatered') {
      return (
        <>
          <circle cx="46" cy="30" r="1.5" fill="black" />
          <circle cx="54" cy="30" r="1.5" fill="black" />
          <path d="M44 27 l4 1" stroke="black" strokeWidth="1.5" fill="none" />
          <path d="M56 27 l-4 1" stroke="black" strokeWidth="1.5" fill="none" />
          <path d="M48 37 q2 -2 4 0" stroke="black" strokeWidth="1.5" fill="none" />
        </>
      );
    }
    return (
      <>
        <circle cx="46" cy="30" r="1.5" fill="black" />
        <circle cx="54" cy="30" r="1.5" fill="black" />
        <path d="M47 35 q3 4 6 0" stroke="black" strokeWidth="1.2" fill="none" />
      </>
    );
  };

  const Sun = () => {
    const style: React.CSSProperties = {
      opacity: plantState !== 'droopy' ? 1 : 0,
      transition: 'opacity 0.5s',
      transform: `rotate(${sunRotation}deg)`,
      transformOrigin: '25px 15px',
    };
    return (
      <g style={style}>
        <circle cx="25" cy="15" r="8" fill="yellow" />
        <line x1="25" y1="5" x2="25" y2="25" stroke="yellow" strokeWidth="2" />
        <line x1="15" y1="15" x2="35" y2="15" stroke="yellow" strokeWidth="2" />
        <line x1="18" y1="8" x2="32" y2="22" stroke="yellow" strokeWidth="2" />
        <line x1="18" y1="22" x2="32" y2="8" stroke="yellow" strokeWidth="2" />
      </g>
    );
  };

  const SadCloud = () => (<g style={{ opacity: plantState === 'droopy' ? 1 : 0, transition: 'opacity 0.5s' }}><path d="M70 25 q-5 0 -5 -5 a5 5 0 0 1 5 -5 q0 -5 5 -5 a5 5 0 0 1 5 5 q5 0 5 5 a5 5 0 0 1 -5 5z" fill="#A0A0A0"/><line x1="72" y1="30" x2="70" y2="35" stroke="#4682B4" strokeWidth="2"/><line x1="78" y1="30" x2="76" y2="35" stroke="#4682B4" strokeWidth="2"/><path d="M72 20 q3 -4 6 0" stroke="black" strokeWidth="1" fill="none" /></g>);

  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <Sun />
        <SadCloud />
        <path d="M20 85 h60 v10 h-60 z" fill="#D2B48C" />
        <path d="M25 70 h50 l-5 15 h-40 z" fill="#8B4513" />
        <path d="M25 70 h50 a25,5 0 0,0 -50,0" fill="#5C4033" />
        <g style={activePlantStyle}>
          <path d="M50 70 Q 52 50 50 30" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" />
          <path d="M50 55 Q 40 50 30 40 C 35 50 45 55 50 55" fill="hsl(var(--primary))" style={droopyLeafStyle} />
          <path d="M50 55 Q 60 50 70 40 C 65 50 55 55 50 55" fill="hsl(var(--primary))" style={droopyRightLeafStyle} />
          <path d="M50 45 Q 42 40 35 30 C 40 38 48 43 50 45" fill="hsl(var(--primary))" style={droopyLeafStyle} />
          <path d="M50 45 Q 58 40 65 30 C 60 38 52 43 50 45" fill="hsl(var(--primary))" style={droopyRightLeafStyle} />
           <g style={droopyFlowerStyle}>
            {/* Sunflower Petals */}
            {Array.from({ length: 12 }).map((_, i) => (
              <path
                key={i}
                d="M50 32 C 47 20, 53 20, 50 12 Z" // Teardrop petal shape
                fill="gold"
                style={{
                  transform: `rotate(${(i * 360) / 12}deg)`,
                  transformOrigin: '50px 32px',
                }}
              />
            ))}
            {/* Center of Sunflower */}
            <circle cx="50" cy="32" r="10" fill="#654321" />
            <Face />
          </g>
        </g>
      </svg>
    </div>
  );
};
