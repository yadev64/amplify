import React, { useState } from 'react';

const App = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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

      // Get microphone access
      const stream = await getUserMedia.call(navigator.mediaDevices || navigator, { audio: true });
      setMediaStream(stream);

      const source = context.createMediaStreamSource(stream);

      const destination = context.destination;

      source.connect(destination);

      setIsAudioPlaying(true); 
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
  };

  return (
    <div className="App">
      <h1>Microphone to Speaker</h1>
      <p>
        Click the button below to start routing microphone input to your speakers.
      </p>
      {!isAudioPlaying ? (
        <button onClick={startAudio}>Start Audio</button>
      ) : (
        <button onClick={stopAudio}>Stop Audio</button>
      )}
    </div>
  );
};

export default App;
