import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Studio from '../pages/Studio';
import MediaManager from '../components/studio/MediaManager';
import MediaEditor from '../components/studio/MediaEditor';
import Analytics from '../components/studio/Analytics';
import Settings from '../components/studio/Settings';

export default function StudioRoutes() {
  return (
    <Routes>
      <Route element={<PrivateRoute><Studio /></PrivateRoute>}>
        <Route index element={<MediaManager />} />
        <Route path="editor" element={<MediaEditor />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/studio" replace />} />
      </Route>
    </Routes>
  );
}