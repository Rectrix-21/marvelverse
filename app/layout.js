import localFont from "next/font/local";
import "./globals.css";
import BackgroundVideo from "./BackgroundVideo";
import PageTransition from "./PageTransition";

const marvelFont = localFont({
  src: "../public/fonts/SpeedyRegular-7BLoE.ttf",
  variable: "--font-marvel",
});

export const metadata = {
  title: "Marvelverse",
  description: "I love you 3000 <3",
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
      </body>
    </html>
  );
}