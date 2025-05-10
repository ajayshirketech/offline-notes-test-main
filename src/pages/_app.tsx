import { AppProps } from 'next/app';
import GlobalStyles from '../styles/GlobalStyles';
import '../styles/tailwind.css';
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyles />
      <Component {...pageProps} />
    </>
  );
}