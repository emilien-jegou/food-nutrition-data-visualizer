import { component$, useSignal, $, useComputed$ } from '@builder.io/qwik';
import { Input } from '~/common/input';
import { Table, Td, Th } from '~/common/table';
import foodCategories from '~/data/food-categories.json';
import foodData from '~/data/usda-foods.json';
import { asyncMap } from '~/utils/async';
import type { Signal, QRL } from '@builder.io/qwik';
import type { XOR } from 'ts-essentials';

import './styles.css';

type TableSortingOrder = 'asc' | 'desc';

type ColumnDef<RowData> = XOR<
  { id?: string; accessorKey: keyof RowData },
  { id: string; accessorFn: QRL<(v: RowData) => any> }
> & {
  label?: string;

  // default: true
  sortable?: boolean;

  rowWidthPx?: number;
};

type FoodCategory = string;

export type Food = {
  name: string;
  category: FoodCategory;
  nutrients: Partial<Record<string, number>>;
  proteinConversionFactor?: number;
  calorieConversionFactor?: {
    proteinValue: number;
    fatValue: number;
    carbohydrateValue: number;
    nitrogenValue?: number;
  };
  metadata: any[] | null;
};

const defaultColumns: ColumnDef<Food>[] = [
  { accessorKey: 'name', label: 'Food name', rowWidthPx: 500 },
  { accessorKey: 'category', label: 'Category' },
  {
    id: 'Protein',
    label: 'Protein (grams per 100)',
    accessorFn: $((row) => row.nutrients['Protein'] ?? 0),
  },
  {
    id: 'Carbohydrate, by difference',
    label: 'Carbs (grams per 100)',
    accessorFn: $((row) => row.nutrients['Carbohydrate, by difference'] ?? 0),
  },
  {
    id: 'Total lipid (fat)',
    label: 'Fat (grams per 100)',
    accessorFn: $((row) => row.nutrients['Total lipid (fat)'] ?? 0),
  },
  {
    id: 'Fiber, total dietary',
    label: 'Fiber (grams per 100)',
    accessorFn: $((row) => row.nutrients['Fiber, total dietary'] ?? 0),
  },
];

type TableSorting = {
  columnId: string;
  order: TableSortingOrder;
} | null;

type SortedRow = {
  rowId: string;
  widthPx?: number;
  rows: { id: string; bgColor?: string; value: any }[];
};

export const NutritionTable = component$(() => {
  const data = useSignal<Food[]>(foodData);
  const sorting = useSignal<TableSorting>(null);
  const filterInput = useSignal<string>('');
  const columns = useSignal(defaultColumns);

  const sortedData: Signal<SortedRow[]> = useComputed$(async () => {
    const sort = sorting.value ?? { columnId: 'name', order: 'asc' };

    const cols = columns.value;
    let column = cols.find((c) => (c.id || c.accessorKey) === sort.columnId);

    if (!column) {
      column = cols[0];
    }

    const mapped = await asyncMap(data.value, async (v: any) => [
      column.accessorKey ? v[column.accessorKey!] : await column.accessorFn!(v),
      v,
    ]);

    const sortedFoods: Food[] = mapped
      .sort((a, b): any => {
        if (sort.order === 'desc') {
          const c = a;
          a = b;
          b = c;
        }
        if (typeof a[0] === 'string') {
          return a[0].localeCompare(b[0]);
        } else if (typeof a[0] === 'number') {
          return a[0] - b[0];
        }
      })
      .map((v) => v[1]);

    const sortedRows = await asyncMap(sortedFoods, async (r) => ({
      rowId: r.name,
      rows: await asyncMap(cols, async (c) => {
        const id = c.id ?? c.accessorKey!;
        const value = c.accessorKey ? r[c.accessorKey!] : await c.accessorFn!(r);
        return {
          id,
          widthPx: c.rowWidthPx,
          bgColor: id === 'category' ? (foodCategories as any)[value]?.color : undefined,
          value,
        };
      }),
    }));

    return sortedRows;
  });

  const filteredData = useComputed$(() => {
    const v = filterInput.value.toLowerCase().split(' ').join(' ');
    return sortedData.value.filter((r) => r.rowId.toLowerCase().includes(v));
  });

  return (
    <div class="text-sm">
      <div class="p-2">
        <Input
          name="filter-by-name"
          placeholder="Filter by name..."
          class="w-full"
          onInput$={(v) => {
            filterInput.value = v;
          }}
        />
      </div>
      <Table>
        <thead>
          <tr>
            {columns.value.map((column) => {
              const id = column.id ?? column.accessorKey!;
              const label = column.label ?? column.id ?? column.accessorKey;

              return (
                <Th
                  key={id}
                  onClick$={$(() => {
                    if (column.sortable === false) return;
                    if (sorting.value === null || sorting.value.columnId !== id) {
                      sorting.value = {
                        order: 'asc',
                        columnId: id,
                      };
                    } else {
                      if (sorting.value.order === 'asc') {
                        sorting.value = { ...sorting.value, order: 'desc' };
                      } else {
                        sorting.value = null;
                      }
                    }
                  })}
                  title={column.sortable ? `Sort table by ${label}` : undefined}
                >
                  {label}
                </Th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filteredData.value.map((row) => {
            return (
              <tr key={row.rowId}>
                {row.rows.map((r) => (
                  <Td key={r.id} style={{ background: r.bgColor }}>
                    {' '}
                    {r.value}{' '}
                  </Td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div>{sortedData.value.length.toLocaleString()} Rows</div>
    </div>
  );
});
