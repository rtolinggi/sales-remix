/* eslint-disable jsx-a11y/anchor-has-content */
import {
  IconChevronRight,
  IconUserCheck,
  IconDashboard,
  IconBuildingWarehouse,
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
    icon: IconBuildingWarehouse,
    label: "Master Data",
    to: "setting",
    rightSection: <IconChevronRight size={14} stroke={1.5} />,
    pathName: "/setting",
    color: "cyan",
    subLink: [
      {
        label: "Store",
        to: "store",
        pathName: "/store",
        color: "cyan",
      },
      {
        label: "Supplier",
        to: "supplier",
        pathName: "/supplier",
        color: "cyan",
      },
      {
        label: "Cluster",
        to: "cluster",
        pathName: "/cluster",
        color: "cyan",
      },
    ],
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
  const items = data.map((item) => (
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
    >
      {item.subLink
        ? item.subLink.map((index) => (
            <NavLink
              key={index.label}
              component={Link}
              to={index.to}
              active={location.pathname === index.pathName}
              label={index.label}
            />
          ))
        : null}
    </NavLink>
  ));

  return <Box sx={{ width: "100%" }}>{items}</Box>;
};

export default NabarContent;
