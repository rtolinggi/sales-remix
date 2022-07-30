import { Stack, Text, Title } from "@mantine/core";

type UserProps = {
  email: string;
  name: string;
};
const NavbarTitle: React.FC<UserProps> = (props) => {
  const { name, email } = props;
  return (
    <>
      <Stack align="center" justify="center" spacing={1}>
        <Title order={5}>{name}</Title>
        <Text color="dimmed" size="xs">
          {email}
        </Text>
      </Stack>
    </>
  );
};

export default NavbarTitle;
