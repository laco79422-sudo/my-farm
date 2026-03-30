import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './contexts/AuthContext';
import { ToastHost } from './components/common/Toast';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastHost />
    </AuthProvider>
  );
}
