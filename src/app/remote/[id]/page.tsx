'use client';

import { signal_server_url } from '@/config/url';
import axios from 'axios';
import React, { useRef, useEffect, useState } from 'react';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';

const socket = io(signal_server_url, {
  path: '/ws/socket.io',
});

export default function Page(props: any) {
  const remote_objid = props.params.id;

  const [peerStream, setPeerStream] = useState<MediaStream | null>(null);
  const peerVideo = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>(null);
  const [remote, setRemote] = useState<any | null>(null);

  useEffect(() => {
    if (!remote) {
      axios
        .get(signal_server_url + '/api/get/remote/' + remote_objid)
        .then((res) => {
          console.log(res.data);
          setRemote(res.data!);
        });
    } else {
      createPeer(remote.signal);
    }
  }, [remote, remote_objid]);

  const createPeer = (signal: any) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    peer.on('signal', (data) => {
      console.log('signal');
      socket.emit('signal', {
        initator: false,
        signal: data,
        sid: remote.sid,
      });
    });

    peer.on('stream', (stream) => {
      console.log(stream);
      setPeerStream(stream);
      if (peerVideo.current) {
        peerVideo.current.srcObject = stream;
      }
    });

    // 시그널링 서버로부터 시그널 데이터 수신
    socket.on('signal', (message) => {
      if (message.initiator) {
        peer.signal(message.signal);
      }
    });

    // peer.signal(signal);

    peerRef.current = peer;
  };

  const connectPeer = (signal: any) => {
    peerRef.current.signal(signal);
  };

  return (
    <div>
      <h1>P2P Streaming</h1>
      <video
        ref={peerVideo}
        autoPlay
      />
      <button
        onClick={() => {
          connectPeer(remote.signal);
        }}
      >
        연결하기
      </button>
    </div>
  );
}
