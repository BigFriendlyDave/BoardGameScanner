import { createBrowserRouter } from 'react-router';
import {
  CameraComponent,
  BarcodeScanner,
} from './CurrentWorkingCameraComponent.tsx';

export const router = createBrowserRouter([
  {
    path: '/camera',
    element: <CameraComponent />,
  },
  {
    path: '/scanner',
    element: <BarcodeScanner />,
  },
]);
