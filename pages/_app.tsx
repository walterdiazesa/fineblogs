import React from "react";
import "../styles/globals.css";
import initAuth from "../utils/initAuth";
import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/globals.css";
import "tailwindcss/tailwind.css";

initAuth();

/**
 * The first point for our next app.
 * @param {NextComponentType<NextPageContext, any, P>} Component page to render.
 * @param {any} pageProps page props.
 * @return {React.Component} return page
 */
function MyApp({ Component, pageProps }: AppProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Tammudu+2:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          async
          src="https://cdn.jsdelivr.net/npm/sweetalert2@11"
        ></script>
        {/* <link rel="shortcut icon" href="favicon.ico" /> */}
        <title>walterdiazesa</title>
      </Head>
      <div style={{ minHeight: "100vh" }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
