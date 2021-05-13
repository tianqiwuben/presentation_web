import '../styles/global.css'

import { SnackbarProvider } from 'notistack';

export default function App({ Component, pageProps }) {
  return (
    <SnackbarProvider>
      <Component {...pageProps} />
    </SnackbarProvider>
  )
}