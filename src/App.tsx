import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import TuitionPaymentPage from "./pages/TuitionPaymentPage";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/tuition-payment" element={<TuitionPaymentPage />} />
        <Route path="/transaction-history" element={<TransactionHistoryPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
