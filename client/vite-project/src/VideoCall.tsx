import { useEffect, useRef, useState } from "react";
import type { OfferAnswer, IceCandidate } from "./types";
import { socket } from "./services/socket";

interface Props {
  room: string;
}

export default function VideoCall({ room }: Props) {
  const localVideo = useRef<HTMLVideoElement | null>(null);
  const remoteVideo = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const setup = async () => {
      const safeRoom = room.trim();
      if (!safeRoom) {
        setError("Please enter a room ID before joining.");
        return;
      }

      const ok = await start();
      if (!ok) return;

      socket.connect();
      socket.emit("join-room", safeRoom);

      socket.on("user-joined", createOffer);
      socket.on("offer", handleOffer);
      socket.on("answer", handleAnswer);
      socket.on("ice-candidate", handleICE);
    };

    void setup();

    return () => {
      socket.off("user-joined", createOffer);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleICE);

      peerRef.current?.close();
      peerRef.current = null;

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, [room]);

  const start = async () => {
    try {
      const stream: MediaStream =
        await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => {
        peerRef.current?.addTrack(track, stream);
      });

      peerRef.current.ontrack = (event: RTCTrackEvent) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      peerRef.current.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      setError("");
      return true;
    } catch {
      setError("Could not access camera/microphone. Please allow permissions and refresh.");
      return false;
    }
  };

  const createOffer = async () => {
    if (!peerRef.current) return;

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);

    socket.emit("offer", offer);
  };

  const handleOffer = async (offer: OfferAnswer) => {
    if (!peerRef.current) return;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);

    socket.emit("answer", answer);
  };

  const handleAnswer = async (answer: OfferAnswer) => {
    if (!peerRef.current) return;

    await peerRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleICE = async (candidate: IceCandidate) => {
    if (!peerRef.current) return;

    await peerRef.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Room: {room}</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <video
          ref={localVideo}
          autoPlay
          playsInline
          muted
          style={{ width: "300px", borderRadius: "10px" }}
        />

        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          style={{ width: "300px", borderRadius: "10px" }}
        />
      </div>
    </div>
  );
}