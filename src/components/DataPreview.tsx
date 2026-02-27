import { DatasetRow } from '@/agents/types';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface DataPreviewProps {
  data: DatasetRow[];
  headers: string[];
}

export function DataPreview({ data, headers }: DataPreviewProps) {
  const preview = data.slice(0, 10);

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h} className="whitespace-nowrap text-xs">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.map((row, i) => (
            <TableRow key={i}>
              {headers.map((h) => (
                <TableCell key={h} className="whitespace-nowrap text-xs">
                  {row[h] !== null && row[h] !== undefined ? String(row[h]) : '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
