import { Row } from "@tanstack/react-table";

export const DebugTableRow = ({ row }: { row: Row<any> }) => {
  return (
    <pre className="text-sm">
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  );
};
