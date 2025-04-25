/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import 'primeicons/primeicons.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import { isDev } from "@/utils/env";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <head>
        <link rel='manifest' href='/manifest.json'/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rammetto+One&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
        <meta name="x5-fullscreen" content="true"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name='full-screen' content='true' />
        <Script id="inline-script" strategy="afterInteractive">
            {`
            if ('serviceWorker' in navigator) {
              if (
                (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                (window.navigator.standalone === true)
              ) {
                console.log('PWA is installed and running in standalone mode.');
              } else {
                console.log('Running in browser tab, Service Worker not registered.');
                // navigator.serviceWorker.register('/sw.js')
                //   .then(registration => {
                //     console.log('Service Worker registered:', registration);
                //   })
                //   .catch(error => {
                //     console.error('Service Worker registration failed:', error);
                //   });
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(registration => {
                    registration.unregister().then(success => {
                      if (success) {
                        console.log('Service Worker unregistered successfully.');
                      } else {
                        console.log('Service Worker unregistration failed.');
                      }
                    });
                  });
                }).catch(error => {
                  console.error('Error fetching Service Worker registrations:', error);
                });
              }
            }
          `}
        </Script>
    </head>
    <body>
    <div>
        {children}
    </div>
    {
        !isDev && <GoogleAnalytics gaId="" />
        }
      </body>
    </html>
  );
}
