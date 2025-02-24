import { Suspense } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import Home from "./components/home";
import JoinRoom from "./components/chat/JoinRoom";
import AuthPage from "./components/auth/AuthPage";
import { useAuth } from "./hooks/useAuth";
import routes from "tempo-routes";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark bg-background">
        Loading...
      </div>
    );
  }

  return (
    <div className="dark bg-background min-h-screen text-white">
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/join/:roomId"
              element={user ? <JoinRoom /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to="/" replace />}
            />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </div>
  );
}

export default App;
