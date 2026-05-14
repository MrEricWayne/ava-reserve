import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../lib/AuthContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            borderLeft: '3px solid #C0272D',
            borderRadius: '4px',
          },
          success: { iconTheme: { primary: '#1E6B42', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#B91C1C', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  )
}
