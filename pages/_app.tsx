import type { AppProps } from 'next/app';
import Navigation from '../components/Navigation';
import '../styles/globals.css';
import '../styles/components/Navigation.css';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Navigation />
            <main className="main-content">
                <Component {...pageProps} />
            </main>
        </>
    );
}

export default MyApp; 