import React, { useState } from "react";
import {
  Group,
  Pagination,
  Select,
  Table as CTable,
  Text,
  TextInput,
} from "@mantine/core";

import type { SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconArrowsDown, IconArrowsUp, IconSearch } from "@tabler/icons";

type Props = {
  data: Array<{}>;
  columns: any;
  visibility: {};
};

const DataTable: React.FC<Props> = ({ columns, data, visibility }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] = useState(visibility);

  const table = useReactTable({
    data,
    columns,
    enableFilters: true,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <>
      <Group
        grow
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Group position="left">
          <TextInput
            placeholder="Search Data...."
            icon={<IconSearch size={20} />}
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </Group>
        <Group spacing="xs" position="right">
          <Text>Showing</Text>
          <Select
            defaultValue={String(10)}
            data={[String(5), String(10), String(15), String(20)]}
            style={{ width: "4rem" }}
            onChange={(e) => table.setPageSize(Number(e))}
          />
          <Text>Entries</Text>
        </Group>
      </Group>
      <CTable verticalSpacing="md" striped highlightOnHover>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        style: header.column.getCanSort()
                          ? { cursor: "pointer" }
                          : {},
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: (
                          <IconArrowsUp
                            size={16}
                            style={{ marginLeft: "5px", marginTop: "5px" }}
                          />
                        ),
                        desc: (
                          <IconArrowsDown
                            size={16}
                            style={{ marginLeft: "5px", marginTop: "5px" }}
                          />
                        ),
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </CTable>
      <Group
        grow
        style={{
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Group>
          <Text>{`Page ${
            table.getState().pagination.pageIndex + 1
          } of  ${table.getPageCount()}`}</Text>
          <Text>{table.getPrePaginationRowModel().rows.length} Record</Text>
        </Group>
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          total={table.getPageCount()}
          withEdges
          onChange={(page) => {
            table.setPageIndex(page - 1);
          }}
          position="right"
          styles={(theme) => ({
            item: {
              "&[data-active]": {
                backgroundImage: theme.colorScheme,
              },
            },
          })}
        />
      </Group>
    </>
  );
};

export default DataTable;
