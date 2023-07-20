// based on https://tanstack.com/table/v8/docs/examples/react/sub-components
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment } from "react";
interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  renderSubComponent: (props: { row: Row<TData> }) => React.ReactElement;
  getRowCanExpand: (row: Row<TData>) => boolean;
  state: object;
}

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    isBorderless?: boolean;
    title?: string;
  }
}

export function ExpandableTable<TData>({
  data,
  columns,
  renderSubComponent,
  getRowCanExpand,
  state = {},
}: TableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getRowCanExpand,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableHiding: true,
    state,
  });
  return (
    <div className="p-2 overflow-x-auto">
      <table className="table-auto">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup?.headers?.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: `${header.getSize()}px` }}
                    className={`relative group ${header.column.columnDef.meta?.isBorderless ? '': "p-2 border-x border-slate-900"}`}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                    <div
                      key={header.id + "resizer"}
                      className="w-1 ml-2 group-hover:bg-green-600 h-full absolute select-none right-0 top-0 cursor-col-resize"
                      onPointerDown={header.getResizeHandler()}
                    ></div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <Fragment key={row.id}>
                <tr>
                  {/* first row is a normal row */}
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id} className={`${cell.column.columnDef.meta?.isBorderless ? '': "p-2 border-x border-slate-900"}`}>
                        <div
                          className="line-clamp-1"
                          {...{
                            title:
                              cell.column.columnDef.meta?.title ??
                              (typeof cell.getValue() == "string"
                                ? (cell.getValue() as string)
                                : undefined),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    {/* 2nd row is a custom 1 cell row */}
                    <td colSpan={row.getVisibleCells().length}>
                      {renderSubComponent({ row })}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div>{table.getRowModel().rows.length} Rows</div>
    </div>
  );
}
