import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Protected } from "./components/Protected";
import { useAuthStore } from "./store/authStore";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Explore } from "./pages/Explore";
import { CreateHunt } from "./pages/CreateHunt";
import { JoinHunt } from "./pages/JoinHunt";
import { HuntDetail } from "./pages/HuntDetail";
import { MyHunts } from "./pages/MyHunts";
import { Leaderboard } from "./pages/Leaderboard";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

function Shell({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  return (
    <div className="min-h-screen">
      {currentUser && <NavBar />}
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<JoinHunt />} />
          <Route
            path="/explore"
            element={
              <Protected>
                <Explore />
              </Protected>
            }
          />
          <Route
            path="/create-hunt"
            element={
              <Protected>
                <CreateHunt />
              </Protected>
            }
          />
          <Route
            path="/hunt/:huntId"
            element={
              <Protected>
                <HuntDetail />
              </Protected>
            }
          />
          <Route
            path="/my-hunts"
            element={
              <Protected>
                <MyHunts />
              </Protected>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Protected>
                <Leaderboard />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <Profile />
              </Protected>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
