import { useState } from "react";
import VideoCall from "./VideoCall";

function App() {
  const [room, setRoom] = useState<string>("");
  const [join, setJoin] = useState<boolean>(false);

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {!join ? (
        <>
          <h1>Join Video Call</h1>
          <input
            placeholder="Enter Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <br /><br />
          <button onClick={() => setJoin(true)} disabled={!room.trim()}>
            Join
          </button>
        </>
      ) : (
        <VideoCall room={room} />
      )}
    </div>
  );
}

export default App;