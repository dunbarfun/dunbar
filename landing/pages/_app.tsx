import '@/styles/index.scss';
import localFont from "next/font/local";


const haffer = localFont({
  src: [
    {
      path: "../fonts/HafferXH-Heavy.woff2",
      style: "italic",
      weight: "900",
    },
    {
      path: "../fonts/HafferXH-Bold.woff2",
      style: "normal",
      weight: "bold",
    },
    {
      path: "../fonts/HafferXH-SemiBold.woff2",
      style: "normal",
      weight: "600",
    },
    {
      path: "../fonts/HafferXH-Regular.woff2",
      style: "normal",
      weight: "normal",
    },
  ],
  variable: "--font-haffer",
});

function App({ Component, pageProps }: any) {
  return (
    <>
      <style jsx global>
        {`
        :root {
          --font-haffer: ${haffer.style.fontFamily};
        }
        `}
      </style>
      <main className={`${haffer.variable}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
export default App;
