import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { StationAnalytics } from "./pages/StationAnalytics";
import { MapPage } from "./pages/MapPage";
import { Analytics } from "./pages/Analytics";
import { Insights } from "./pages/Insights";
import { UploadPage } from "./pages/UploadPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stations" element={<StationAnalytics />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
