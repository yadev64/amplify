// import React, { useState } from 'react';
// import './App.css'; // Import the custom CSS

// const App = () => {
//   const [audioContext, setAudioContext] = useState(null);
//   const [mediaStream, setMediaStream] = useState(null);
//   const [isAudioPlaying, setIsAudioPlaying] = useState(false);

//   const startAudio = async () => {
//     try {
//       const context = new (window.AudioContext || window.webkitAudioContext)();
//       setAudioContext(context);

//       const getUserMedia = navigator.mediaDevices?.getUserMedia || 
//         navigator.getUserMedia || 
//         navigator.webkitGetUserMedia || 
//         navigator.mozGetUserMedia;

//       if (!getUserMedia) {
//         throw new Error('getUserMedia is not supported in this browser');
//       }

//       const stream = await getUserMedia.call(navigator.mediaDevices || navigator, { audio: true });
//       setMediaStream(stream);

//       const source = context.createMediaStreamSource(stream);
//       const destination = context.destination;
//       source.connect(destination);

//       setIsAudioPlaying(true);
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//     }
//   };

//   const stopAudio = () => {
//     if (mediaStream) {
//       mediaStream.getTracks().forEach(track => track.stop());
//     }
//     if (audioContext) {
//       audioContext.close();
//     }
//     setIsAudioPlaying(false);
//   };

//   const handleMicClick = () => {
//     if (isAudioPlaying) {
//       stopAudio();
//     } else {
//       startAudio();
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Microphone to Speaker</h1>
//       <div 
//         className={`mic-button-85 ${isAudioPlaying ? 'active' : 'idle'}`} 
//         onClick={handleMicClick}
//       >
//          <p className={`${isAudioPlaying ? 'fa-solid fa-microphone-lines-slash' : 'fa-solid fa-microphone-lines'}`}  style={{ color: `${isAudioPlaying ? '#2b4ae4' : '#fff'}`, fontSize: '26px' }}></p>
//       </div>
//     </div>
//   );
// };

// export default App;










import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const App = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startAudio = async () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);

      const getUserMedia = navigator.mediaDevices?.getUserMedia || 
        navigator.getUserMedia || 
        navigator.webkitGetUserMedia || 
        navigator.mozGetUserMedia;

      if (!getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      const stream = await getUserMedia.call(navigator.mediaDevices || navigator, { audio: true });
      setMediaStream(stream);

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyser.connect(context.destination);

      setIsAudioPlaying(true);
      drawVisualizer(); // Start visualizing sound
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudio = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setIsAudioPlaying(false);
    cancelAnimationFrame(animationFrameRef.current); // Stop visualizing sound
  };

  const handleMicClick = () => {
    if (isAudioPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = 'rgb(255, 255, 255)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(240, 240, 240)';

      canvasCtx.beginPath();

      const sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * HEIGHT / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="App">
      <h1>Microphone to Speaker with Visualization</h1>
      <div 
        className={`mic-button-85 ${isAudioPlaying ? 'active' : 'idle'}`} 
        onClick={handleMicClick}
      >
         <p className={`${isAudioPlaying ? 'fa-solid fa-microphone-lines-slash' : 'fa-solid fa-microphone-lines'}`}  style={{ color: `${isAudioPlaying ? '#2b4ae4' : '#fff'}`, fontSize: '26px' }}></p>
      </div>
      <canvas ref={canvasRef} className="visualizer" />
    </div>
  );
};

export default App;

