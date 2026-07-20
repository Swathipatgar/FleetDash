import React from "react";
import { SocketProvider } from "./context/SocketContext";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}

export default App;
