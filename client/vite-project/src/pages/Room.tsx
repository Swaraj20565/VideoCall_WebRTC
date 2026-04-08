import { useEffect, useRef, useState } from "react";
import { socket } from "../services/socket";

const ROOM_ID = "room-1";

const Room = () => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  useEffect(() => {
    // Join room
    socket.emit("join-room", ROOM_ID);

    // Listen events
    socket.on("other-user", (userId: string) => {
      console.log("Other user:", userId);
      setRemoteUserId(userId);
    });

    socket.on("user-joined", (userId: string) => {
      console.log("User joined:", userId);
      setRemoteUserId(userId);
    });

    return () => {
      socket.off("other-user");
      socket.off("user-joined");
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>1-to-1 Video Call</h2>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        {/* Local Video */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "300px", background: "black" }}
        />

        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", background: "black" }}
        />
      </div>

      <p>
        {remoteUserId
          ? `Connected with: ${remoteUserId}`
          : "Waiting for another user..."}
      </p>
    </div>
  );
};

export default Room;