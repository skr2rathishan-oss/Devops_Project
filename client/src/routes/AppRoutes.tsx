import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/loginPage";
import Register from "../pages/RegisterPage";
// ...your other page imports

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={() => {}}
            onGoRegister={() => {}}
            message=""
          />
        }
      />
      <Route
        path="/register"
        element={<Register onRegister={() => {}} onGoLogin={() => {}} />}
      />
      {/* dashboard, tasks etc go here */}
    </Routes>
  );
}

export default AppRoutes;