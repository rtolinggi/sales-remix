import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import type { ActionIconVariant } from "@mantine/core";
import { Sun, MoonStars } from "tabler-icons-react";

type Props = {
  variant?: ActionIconVariant;
  size?: number;
};
const DarkMode: React.FC<Props> = ({ variant, size }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <ActionIcon
      variant={variant}
      color="red"
      onClick={() => toggleColorScheme()}
      title="Dark Mode"
    >
      {dark ? <Sun size={size || 18} /> : <MoonStars size={size || 18} />}
    </ActionIcon>
  );
};

export default DarkMode;
