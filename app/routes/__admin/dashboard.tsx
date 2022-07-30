import { Button, Paper, Title } from "@mantine/core";

const DashboardPage = () => {
  return (
    <>
      <Paper
        radius="md"
        p="sm"
        withBorder
        style={{
          borderLeftWidth: "5px",
          borderBottomWidth: "0px",
          borderLeftColor: "tomato",
          marginBottom: "1rem",
        }}
      >
        <Title order={3}>Dashborad</Title>
      </Paper>
      <Button>Add Dashboard</Button>
    </>
  );
};

export default DashboardPage;
