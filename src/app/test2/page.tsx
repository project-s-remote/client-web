'use client';

import React, { useRef, useEffect, useState } from 'react';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
  path: '/ws/socket.io',
});

const App = () => {
  const [myStream, setMyStream] = useState(null);
  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const [initiator, setInitiator] = useState(false);
  const myVideo = useRef<HTMLVideoElement>(null);
  const peerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream: any) => {
        setMyStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((error) =>
        console.error('Error accessing media devices.', error)
      );
  }, []);

  const createPeer = () => {
    const peer = new SimplePeer({
      initiator: initiator,
      // stream: myStream!!,
      trickle: false,
    });

    peer.on('signal', (data) => {
      // 시그널 데이터를 JSON으로 직렬화하여 다른 피어와 교환합니다.
      console.log(JSON.stringify(data));
      socket.emit('signal', { initator: false, signal: data, sid: 'u5RnizrKdANAGQz5AACp'});
    });

    peer.on('stream', (stream) => {
      setPeerStream(stream);
      if (peerVideo.current) {
        peerVideo.current.srcObject = stream;
      }
    });

    peerRef.current = peer;
  };

  const connectPeer = (signalData: any) => {
    const peer = peerRef.current;
    peer!.signal(signalData);
  };

  return (
    <div>
      <h1>P2P Streaming</h1>
      <div>
        <video
          ref={peerVideo}
          autoPlay
        />
      </div>
      <button onClick={() => setInitiator(true)}>Become Initiator</button>
      <button onClick={createPeer}>Create Peer</button>
      <textarea
        onChange={(e) => connectPeer(JSON.parse(e.target.value))}
        placeholder="Paste signal data here"
      />
    </div>
  );
};

export default App;
