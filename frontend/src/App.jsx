import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Dashboard from "./pages/Dashboard/Dashboard";
import AuthPage from "./pages/Auth/AuthPage";

function MainContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
