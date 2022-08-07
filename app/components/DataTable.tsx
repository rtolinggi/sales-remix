import React, { useState } from "react";
import { Group, Pagination, Table as CTable, Text } from "@mantine/core";
import type { SortingState } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconArrowDown, IconArrowUp } from "@tabler/icons";

type Props = {
  data: Array<{}>;
  columns: any;
  visibility: {};
};

const DataTable: React.FC<Props> = (props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState(props.visibility);
  console.log(props.visibility);

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    state: {
      sorting,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <>
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
                          <IconArrowUp
                            size={16}
                            style={{ marginLeft: "5px" }}
                          />
                        ),
                        desc: (
                          <IconArrowDown
                            size={16}
                            style={{ marginLeft: "5px" }}
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
        <Text>{`Page ${
          table.getState().pagination.pageIndex + 1
        } of  ${table.getPageCount()}`}</Text>
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
