import React, { createContext, FC, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { getCookie } from "../assets/constants/getCookie";
import { darkTheme, lightTheme } from "../assets/theme/theme";

type ThemeContextType = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

type Props = {
  isDarkTheme?: string;
};

const getThemeState = (dark = getCookie("isDarkTheme")) => !dark || dark === "true";

export const ThemeChangeProvider: FC<Props> = ({ children, ...props }) => {
  const [isDarkTheme, setTheme] = useState(() => getThemeState(props.isDarkTheme));

  const toggleTheme = () => {
    setTheme(!isDarkTheme);
    document.cookie = `isDarkTheme=${String(!isDarkTheme)};domain=${process.env.NEXT_PUBLIC_DOMAIN};path=/`;
  };

  const themeSwitch = ({ altKey, key }: KeyboardEvent) => altKey && key === "a" && toggleTheme();

  useEffect(() => {
    setTheme(getThemeState());
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", themeSwitch);

    return () => document.removeEventListener("keydown", themeSwitch);
  }, [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
