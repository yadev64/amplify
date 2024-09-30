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
    cancelAnimationFrame(animationFrameRef.current); 
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

      canvasCtx.fillStyle = 'rgb(245, 245, 250)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(192, 192, 216)';

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
     <a 
        href="https://github.com/yadev64/amplify"
        target="_blank" 
        rel="noopener noreferrer" 
        className="github-icon"
      >
        <i class="fa-brands fa-github"></i>
      </a>
      <h1>Amplify 🎙️</h1>
      <canvas ref={canvasRef} className="visualizer" />
      <div 
        className={`button-67 ${isAudioPlaying ? 'active' : 'idle'}`} 
        onClick={handleMicClick}
        style={{width: '100px'}}
      >
         <p className={`${isAudioPlaying ? 'fa-solid fa-microphone-lines-slash' : 'fa-solid fa-microphone-lines'}`}  style={{ color: `${isAudioPlaying ? '#66668A' : '#C0C0D8'}`, fontSize: '26px' }}></p>
      </div>
      <p className='footer-text'>made with 🩶 by <b><a href="https://github.com/yadev64">Yadev Jayachandran</a></b></p>
    </div>
  );
};



export default App;

