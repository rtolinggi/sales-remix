/* eslint-disable jsx-a11y/anchor-has-content */
import {
  IconFingerprint,
  IconChevronRight,
  IconUserCheck,
  IconDashboard,
} from "@tabler/icons";
import { Link, useLocation } from "@remix-run/react";
import { Box, NavLink, ThemeIcon } from "@mantine/core";

const data = [
  {
    icon: IconDashboard,
    label: "Dashboard",
    to: "dashboard",
    pathName: "/dashboard",
    color: "red",
  },
  {
    icon: IconFingerprint,
    label: "Security",
    to: "setting",
    rightSection: <IconChevronRight size={14} stroke={1.5} />,
    pathName: "/setting",
    color: "cyan",
  },
  {
    icon: IconUserCheck,
    label: "Employee",
    to: "employee",
    pathName: "/employee",
    color: "green",
  },
];

const NabarContent: React.FC = () => {
  const location = useLocation();
  const items = data.map((item, index) => (
    <NavLink
      key={item.label}
      component={Link}
      to={item.to}
      active={location.pathname === item.pathName}
      label={item.label}
      rightSection={item.rightSection}
      icon={
        <ThemeIcon color={item.color} variant="light">
          <item.icon size={16} stroke={1.5} />
        </ThemeIcon>
      }
    />
  ));

  return <Box sx={{ width: "100%" }}>{items}</Box>;
};

export default NabarContent;
