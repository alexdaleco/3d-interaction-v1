import React, { useState, useEffect } from 'react';

const faceColors = {
  front: 'linear-gradient(135deg, #4299e1, #667eea)',
  back: 'linear-gradient(135deg, #667eea, #764ba2)',
  right: 'linear-gradient(135deg, #764ba2, #6B46C1)',
  left: 'linear-gradient(135deg, #6B46C1, #4299e1)',
  top: 'linear-gradient(135deg, #4299e1, #6B46C1)',
  bottom: 'linear-gradient(135deg, #6B46C1, #4299e1)'
};

const CubeWithSelectionFrame = ({ autoRotate, interactionLogic }) => {
  const [rotation, setRotation] = useState({ x: -22.5, y: 45 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRotation({ x: -22.5, y: 225 });
      setTimeout(() => setRotation({ x: -22.5, y: 45 }), 1000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = (e) => {
    interactionLogic.handleStart(e, setIsDragging, setLastPosition);
  };

  const handleMove = (e) => {
    if (!isDragging || autoRotate) return;
    interactionLogic.handleMove(e, lastPosition, setRotation, setPosition, setLastPosition);
  };

  const handleEnd = () => {
    interactionLogic.handleEnd(setIsDragging);
  };

  const handleCubeClick = (e) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
    interactionLogic.handleCubeClick && interactionLogic.handleCubeClick();
  };

  const cubeStyle = {
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    animation: autoRotate ? 'spin 10s infinite linear' : 'none',
  };

  const selectionFrameStyle = {
    position: 'absolute',
    width: '120%',
    height: '120%',
    border: '4px solid #8B3DFF',
    borderRadius: '12px',
    top: '-10%',
    left: '-10%',
    pointerEvents: 'none',
    opacity: isSelected ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
  };

  return (
    <div className="scene w-full h-full rounded-lg shadow-lg overflow-hidden relative"
         style={{ backgroundColor: '#CBCBCB' }}
         onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
         onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
         onClick={() => setIsSelected(false)}>
      <div className="absolute w-40 h-40" 
           style={{
             left: `calc(50% + ${position.x}px)`, 
             top: `calc(50% + ${position.y}px)`, 
             transform: 'translate(-50%, -50%)',
             perspective: '1000px'
           }}>
        <div className="cube w-full h-full relative transform-style-preserve-3d" 
             style={cubeStyle}
             onClick={handleCubeClick}>
          {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
            <div key={face} 
                 className="cube-face absolute w-full h-full flex items-center justify-center text-white font-bold text-xl"
                 style={{
                   transform: `${face === 'front' ? 'translateZ(80px)' :
                               face === 'back' ? 'rotateY(180deg) translateZ(80px)' :
                               face === 'right' ? 'rotateY(90deg) translateZ(80px)' :
                               face === 'left' ? 'rotateY(-90deg) translateZ(80px)' :
                               face === 'top' ? 'rotateX(90deg) translateZ(80px)' :
                               'rotateX(-90deg) translateZ(80px)'}`,
                   background: faceColors[face],
                   boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)',
                   backfaceVisibility: 'hidden'
                 }}>
              {face.charAt(0).toUpperCase()}
            </div>
          ))}
          <div style={selectionFrameStyle}></div>
        </div>
      </div>
      {interactionLogic.renderInstructions && interactionLogic.renderInstructions()}
    </div>
  );
};

const Cube3DOption1 = ({ autoRotate }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const interactionLogic = {
    handleStart: (e, setIsDragging, setLastPosition) => {
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setIsDragging(true);
      setLastPosition({ x: clientX, y: clientY });
    },
    handleMove: (e, lastPosition, setRotation, setPosition, setLastPosition) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - lastPosition.x;
      const deltaY = clientY - lastPosition.y;
      
      if (e.touches && e.touches.length > 1 || e.button === 2) {
        setRotation(prev => ({
          x: prev.x - deltaY * 0.5,
          y: prev.y + deltaX * 0.5
        }));
      } else {
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }
      setLastPosition({ x: clientX, y: clientY });
    },
    handleEnd: (setIsDragging) => {
      setIsDragging(false);
    },
    handleCubeClick: () => {
      setShowInstructions(true);
      setTimeout(() => setShowInstructions(false), 3000);
    },
    renderInstructions: () => showInstructions && (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg text-sm">
          <p>👆 Drag with one finger to move</p>
          <p>✌️ Drag with two fingers to rotate</p>
          <p>🖱️ Right-click drag to rotate (on desktop)</p>
        </div>
      </div>
    )
  };

  return <CubeWithSelectionFrame autoRotate={autoRotate} interactionLogic={interactionLogic} />;
};

const Cube3DOption2 = ({ autoRotate }) => {
  const [showArrows, setShowArrows] = useState(false);

  const interactionLogic = {
    handleStart: (e, setIsDragging, setLastPosition) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setIsDragging(true);
      setLastPosition({ x: clientX, y: clientY });
    },
    handleMove: (e, lastPosition, setRotation, setPosition, setLastPosition) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - lastPosition.x;
      const deltaY = clientY - lastPosition.y;
      
      if (e.shiftKey || (e.touches && e.touches.length > 1)) {
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      } else {
        setRotation(prev => ({
          x: prev.x - deltaY * 0.5,
          y: prev.y + deltaX * 0.5
        }));
      }
      setLastPosition({ x: clientX, y: clientY });
    },
    handleEnd: (setIsDragging) => {
      setIsDragging(false);
    },
    handleCubeClick: () => {
      setShowArrows(true);
      setTimeout(() => setShowArrows(false), 2000);
    },
    renderInstructions: () => showArrows && (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 left-2 text-gray-600 text-sm">↖️ Drag to rotate</div>
        <div className="absolute bottom-2 right-2 text-gray-600 text-sm">Shift+Drag to move ↗️</div>
      </div>
    )
  };

  return <CubeWithSelectionFrame autoRotate={autoRotate} interactionLogic={interactionLogic} />;
};

const Cube3DOption3 = ({ autoRotate }) => {
  const [mode, setMode] = useState('rotate');

  const interactionLogic = {
    handleStart: (e, setIsDragging, setLastPosition) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setIsDragging(true);
      setLastPosition({ x: clientX, y: clientY });
    },
    handleMove: (e, lastPosition, setRotation, setPosition, setLastPosition) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - lastPosition.x;
      const deltaY = clientY - lastPosition.y;
      
      if (mode === 'move') {
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      } else {
        setRotation(prev => ({
          x: prev.x - deltaY * 0.5,
          y: prev.y + deltaX * 0.5
        }));
      }
      setLastPosition({ x: clientX, y: clientY });
    },
    handleEnd: (setIsDragging) => {
      setIsDragging(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#CBCBCB' }}>
      <div className="flex-grow relative">
        <CubeWithSelectionFrame autoRotate={autoRotate} interactionLogic={interactionLogic} />
      </div>
      <div className="flex justify-center mt-4 space-x-4 pb-4">
        <button
          onClick={() => setMode('rotate')}
          className={`p-2 rounded-full ${mode === 'rotate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          title="Rotate mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={() => setMode('move')}
          className={`p-2 rounded-full ${mode === 'move' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          title="Move mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const TabbedCubeInterface = () => {
  const [activeTab, setActiveTab] = useState('option1');
  const [autoRotate, setAutoRotate] = useState(false);

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  return (
    <div className="w-full h-screen px-4 py-8 overflow-hidden flex flex-col" style={{ backgroundColor: '#CBCBCB' }}>
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab('option1')}
          className={`px-4 py-2 ${activeTab === 'option1' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-tl-md rounded-tr-md`}
        >
          Option 1: Intuitive
        </button>
        <button
          onClick={() => setActiveTab('option2')}
          className={`px-4 py-2 ${activeTab === 'option2' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-tl-md rounded-tr-md ml-2`}
        >
          Option 2: Shift+Click
        </button>
        <button
          onClick={() => setActiveTab('option3')}
          className={`px-4 py-2 ${activeTab === 'option3' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-tl-md rounded-tr-md ml-2`}
        >
          Option 3: Toggle Mode
        </button>
      </div>
      <div className="flex-grow">
        {activeTab === 'option1' ? <Cube3DOption1 autoRotate={autoRotate} /> :
         activeTab === 'option2' ? <Cube3DOption2 autoRotate={autoRotate} /> :
         <Cube3DOption3 autoRotate={autoRotate} />}
      </div>
      <button onClick={toggleAutoRotate}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center mx-auto">
        {autoRotate ? '⏹ Stop' : '🔄 Auto'} Rotation
      </button>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotateX(-22.5deg) rotateY(0deg); }
          to { transform: rotateX(-22.5deg) rotateY(360deg); }
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default TabbedCubeInterface;
