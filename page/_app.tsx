import App, { AppContext, AppProps } from "next/app";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "../global.css";
import { DataProvider } from "../src/core/dataProvider";
import { getInitialData } from "../src/core/getInitialData";
import { InitialDataType } from "../src/core/hooks/useInitialData";
import { LoadingScreen } from "../src/ui/LoadingScreen ";
import { ThemeChangeProvider } from "../src/core/themeProvider";

export type PageProps = AppProps["pageProps"] & { initialData: InitialDataType; isDarkTheme?: string };

type Props = Omit<AppProps, "Component"> & {
  Component: AppProps["Component"] & {
    getLayout?: (page: JSX.Element, pageProps: PageProps) => JSX.Element;
  };
};

export default function _App({ Component, pageProps }: Props) {
  const [loading, setLoading] = useState(false);
  const { events } = useRouter();

  const getLayout = Component.getLayout || ((page: JSX.Element) => page);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    events.on("routeChangeStart", handleStart);
    events.on("routeChangeComplete", handleComplete);
    events.on("routeChangeError", handleComplete);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <ThemeChangeProvider isDarkTheme={pageProps.isDarkTheme}>
        <DataProvider value={pageProps.initialData}>{getLayout(<Component {...pageProps} />, pageProps)}</DataProvider>
      </ThemeChangeProvider>
    </>
  );
}

_App.getInitialProps = async (appContext: AppContext) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  appContext.ctx.res?.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=59");

  const isDataRequest = (appContext.ctx?.req as { url: string })?.url.includes("_next/data");
  const initialData = await getInitialData({ locale: appContext.router.locale, fetchCommon: !isDataRequest });

  const props = await App.getInitialProps(appContext);
  const isDarkTheme = (appContext.ctx?.req as { cookies?: { isDarkTheme?: string } })?.cookies?.isDarkTheme;

  return { ...props, pageProps: { ...props.pageProps, initialData, isDarkTheme } };
};
