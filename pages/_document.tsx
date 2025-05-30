import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        {/* ConsentManager CMP: Required for legal and Google Analytics compliance. Do not remove or duplicate. */}
        <Script
          id="consentmanager-cmp"
          strategy="beforeInteractive"
          type="text/javascript"
          data-cmp-ab="1"
          src="https://cdn.consentmanager.net/delivery/js/semiautomatic.min.js"
          data-cmp-cdid="ed8f9885626c9"
          data-cmp-host="a.delivery.consentmanager.net"
          data-cmp-cdn="cdn.consentmanager.net"
          data-cmp-codesrc="0"
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 