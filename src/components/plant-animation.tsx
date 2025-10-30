import React from 'react';

type PlantAnimationProps = {
  moistureLevel: number;
};

export const PlantAnimation: React.FC<PlantAnimationProps> = ({ moistureLevel }) => {
  const getPlantState = () => {
    if (moistureLevel < 40) {
      return 'droopy';
    }
    if (moistureLevel > 85) {
      return 'overwatered';
    }
    return 'healthy';
  };

  const plantState = getPlantState();

  const leafStyle: React.CSSProperties = {
    transition: 'transform 0.5s ease-in-out',
    transformOrigin: 'bottom right',
  };

  const rightLeafStyle: React.CSSProperties = {
    ...leafStyle,
    transformOrigin: 'bottom left',
  }

  const stemStyle: React.CSSProperties = {
    transition: 'transform 0.5s ease-in-out',
    transformOrigin: 'bottom center',
  };

  if (plantState === 'droopy') {
    leafStyle.transform = 'rotate(25deg) scale(0.9)';
    rightLeafStyle.transform = 'rotate(-25deg) scale(0.9)';
    stemStyle.transform = 'rotate(5deg)';
  } else if (plantState === 'overwatered') {
    leafStyle.transform = 'translateY(5px)';
    rightLeafStyle.transform = 'translateY(5px)';
  } else {
    leafStyle.transform = 'rotate(0deg) scale(1)';
    rightLeafStyle.transform = 'rotate(0deg) scale(1)';
    stemStyle.transform = 'rotate(0deg)';
  }

  const Face = () => {
    if (plantState === 'droopy') {
      return (
        <>
          {/* Sad Face */}
          <circle cx="46" cy="30" r="1.5" fill="black" />
          <circle cx="54" cy="30" r="1.5" fill="black" />
          <path d="M47 36 q3 -4 6 0" stroke="black" strokeWidth="1" fill="none" />
        </>
      );
    }
    if (plantState === 'overwatered') {
        return (
            <>
            {/* Worried Face */}
            <circle cx="46" cy="30" r="1.5" fill="black" />
            <circle cx="54" cy="30" r="1.5" fill="black" />
            <path d="M47 36 h6" stroke="black" strokeWidth="1" fill="none" />
            </>
        );
    }
    return (
      <>
        {/* Happy Face */}
        <circle cx="46" cy="30" r="1.5" fill="black" />
        <circle cx="54" cy="30" r="1.5" fill="black" />
        <path d="M47 35 q3 4 6 0" stroke="black" strokeWidth="1.2" fill="none" />
      </>
    );
  };

  return (
    <div className="w-48 h-48 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Pot */}
        <path d="M20 85 h60 v10 h-60 z" fill="#D2B48C" />
        <path d="M25 70 h50 l-5 15 h-40 z" fill="#8B4513" />

        {/* Soil */}
        <path d="M25 70 h50 a25,5 0 0,0 -50,0" fill="#5C4033" />

        {/* Plant */}
        <g>
          {/* Stem */}
          <path d="M50 70 Q 52 50 50 30" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" style={stemStyle} />

          {/* Leaves */}
          <path d="M50 55 Q 40 50 30 40 C 35 50 45 55 50 55" fill="hsl(var(--primary))" style={leafStyle} />
          <path d="M50 55 Q 60 50 70 40 C 65 50 55 55 50 55" fill="hsl(var(--primary))" style={rightLeafStyle} />
          <path d="M50 45 Q 42 40 35 30 C 40 38 48 43 50 45" fill="hsl(var(--primary))" style={{...leafStyle, transform: plantState === 'droopy' ? 'rotate(20deg)' : 'none'}}/>
          <path d="M50 45 Q 58 40 65 30 C 60 38 52 43 50 45" fill="hsl(var(--primary))" style={{...rightLeafStyle, transform: plantState === 'droopy' ? 'rotate(-20deg)' : 'none'}}/>

           {/* Flower */}
           <g style={{...stemStyle, transformOrigin: '50px 30px', transform: plantState === 'droopy' ? 'rotate(10deg)' : 'none'}}>
            {/* Petals */}
            <circle cx="50" cy="32" r="14" fill="hsl(var(--accent))" opacity="0.8"/>
            {/* Face Center */}
            <circle cx="50" cy="32" r="10" fill="hsl(var(--accent))" />
            <Face />
          </g>
        </g>
      </svg>
    </div>
  );
};
