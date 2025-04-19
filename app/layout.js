import localFont from "next/font/local";
import "./globals.css";
import BackgroundVideo from "./BackgroundVideo";
import PageTransition from "./PageTransition";
import Script from "next/script";

const marvelFont = localFont({
  src: "../public/fonts/SpeedyRegular-7BLoE.ttf",
  variable: "--font-marvel",
});

export const metadata = {
  title: "Marvelversed",
  description: "I love you 3000 <3",
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/deadpool-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${marvelFont.className} ${marvelFont.variable} antialiased`}
        style={{ position: "relative", overflow: "auto" }}
      >
        <BackgroundVideo />
        <PageTransition>
          {children}
        </PageTransition>
        <Script
  src="https://cmp.osano.com/m6mxkqK94I/4e2f2393-90b0-4fa0-a813-d42e1502c057/osano.js"
  strategy="afterInteractive"
/>

      </body>
    </html>
  );
}


