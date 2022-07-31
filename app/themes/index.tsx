import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";
import { useState } from "react";
import type { ColorScheme } from "@mantine/core";

const ThemeProvider: React.FC = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const myTheme: MantineThemeOverride = {
    colorScheme: colorScheme,
    primaryColor: "red",
    primaryShade: { dark: 8, light: 7 },
    loader: "bars",
    focusRing: "never",
  };
  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}>
      <MantineProvider withNormalizeCSS withGlobalStyles theme={myTheme}>
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default ThemeProvider;
