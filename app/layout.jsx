import { ToastProvider } from '../contexts/ToastContext';
import './global.css';

export const metadata = {
  title: 'Queue Cure 26',
  description: 'Clinical queue management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
         {children}
        </ToastProvider>
      </body>
    </html>
  );
}