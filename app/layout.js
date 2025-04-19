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
        <PageTransition>{children}</PageTransition>
        <div
          id="cookie-banner"
          className="cookie-banner"
          style={{
            display: "none",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            padding: "15px",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1001,
            flexDirection: "row",
          }}
        >
          <p style={{ margin: 0, padding: "5px 10px" }}>
            We use cookies to improve your experience. By using this site, you
            agree to our cookie policy.
          </p>
          <div
            className="cookie-actions"
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              id="accept-cookies"
              style={{ padding: "5px 10px", cursor: "pointer" }}
            >
              Accept
            </button>
            <button
              id="reject-cookies"
              style={{ padding: "5px 10px", cursor: "pointer" }}
            >
              Reject
            </button>
          </div>
        </div>
        <Script>
          {`
          document.addEventListener("DOMContentLoaded", () => {
            const banner = document.getElementById("cookie-banner");
            const acceptBtn = document.getElementById("accept-cookies");
            const rejectBtn = document.getElementById("reject-cookies");
            const manageLink = document.getElementById("manage-cookies");

            const showBanner = () => {
              if (banner) banner.classList.add("show");
            };
            const hideBanner = () => {
              if (banner) banner.classList.add("show");
            };
            const setConsent = (value) => {
              localStorage.setItem("cookieConsent", value);
              hideBanner();
            };

            if (!localStorage.getItem("cookieConsent")) {
              showBanner();
            }

            if (acceptBtn) acceptBtn.onclick = () => setConsent("accepted");
            if (rejectBtn) rejectBtn.onclick = () => setConsent("rejected");
            if (manageLink) {
              manageLink.onclick = (e) => {
                e.preventDefault();
                showBanner();
              };
            }
          });
        `}
        </Script>
      </body>
    </html>
  );
}
