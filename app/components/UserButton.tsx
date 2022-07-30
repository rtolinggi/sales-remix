import { forwardRef } from "react";
import { IconChevronDown } from "@tabler/icons";
import { Group, Avatar, Text, UnstyledButton } from "@mantine/core";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name?: string;
  email: string;
  icon?: React.ReactNode;
}

// eslint-disable-next-line react/display-name
const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, ...others }: UserButtonProps, ref) => (
    <UnstyledButton
      ref={ref}
      sx={(theme) => ({
        display: "block",
        width: "100%",
        padding: theme.spacing.md,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      })}
      {...others}>
      <Group spacing='xs'>
        <Avatar src={image} radius='xl' size={30} />

        <div style={{ flex: 1 }}>
          <Text size='sm' weight={500}>
            {name}
          </Text>

          <Text color='dimmed' size='xs'>
            {email}
          </Text>
        </div>
        {icon || <IconChevronDown size={16} />}
      </Group>
    </UnstyledButton>
  )
);

export default UserButton;
