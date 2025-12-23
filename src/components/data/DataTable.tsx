import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 列定义接口
 */
export interface ColumnDef<T> {
  /** 列标题 */
  header: string;

  /** 列访问键（用于排序和数据访问） */
  accessorKey?: keyof T;

  /** 自定义单元格渲染函数 */
  cell?: (row: T) => React.ReactNode;

  /** 列类名 */
  className?: string;

  /** 是否可排序 */
  sortable?: boolean;

  /** 列宽度（可选） */
  width?: string;
}

export interface DataTableProps<T> {
  /** 数据数组 */
  data: T[];

  /** 列定义 */
  columns: ColumnDef<T>[];

  /** 获取行唯一键的函数 */
  getRowKey: (row: T) => string | number;

  /** 空状态文本 */
  emptyText?: string;

  /** 是否显示悬停效果 */
  hover?: boolean;

  /** 是否显示斑马条纹 */
  striped?: boolean;

  /** 自定义表格类名 */
  className?: string;

  /** 行点击事件 */
  onRowClick?: (row: T) => void;
}

/**
 * DataTable - 数据表格组件
 *
 * 通用的数据表格组件，支持自定义列渲染、排序、悬停效果。
 * 使用泛型类型确保类型安全。
 *
 * @example
 * 基础用法：
 * ```tsx
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: ColumnDef<User>[] = [
 *   { header: '姓名', accessorKey: 'name' },
 *   { header: '邮箱', accessorKey: 'email' },
 * ];
 *
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   getRowKey={(user) => user.id}
 * />
 * ```
 *
 * @example
 * 自定义单元格渲染：
 * ```tsx
 * const columns: ColumnDef<Organization>[] = [
 *   {
 *     header: '机构',
 *     cell: (org) => (
 *       <div>
 *         <Link href={`/orgs/${org.org_id}`}>{org.org_cn}</Link>
 *         <div className="text-xs text-text-muted">{org.org_id}</div>
 *       </div>
 *     ),
 *   },
 *   {
 *     header: '分组',
 *     accessorKey: 'group',
 *     cell: (org) => org.group === 'local' ? '同城' : '异地',
 *   },
 * ];
 * ```
 *
 * @example
 * 带行点击事件：
 * ```tsx
 * <DataTable
 *   data={orgs}
 *   columns={columns}
 *   getRowKey={(org) => org.org_id}
 *   onRowClick={(org) => router.push(`/orgs/${org.org_id}`)}
 *   hover
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyText = '暂无数据',
  hover = true,
  striped = false,
  className,
  onRowClick,
}: DataTableProps<T>) {
  // 空数据状态
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)}>
        <thead>
          <tr className="text-left text-text-secondary">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'border-b border-border-light py-2',
                  column.className
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const rowKey = getRowKey(row);
            const isClickable = Boolean(onRowClick);

            return (
              <tr
                key={rowKey}
                className={cn(
                  'transition-colors',
                  hover && 'hover:bg-bg-secondary',
                  striped && rowIndex % 2 === 1 && 'bg-bg-secondary/50',
                  isClickable && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      'border-b border-border-light py-2',
                      column.className
                    )}
                  >
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                      ? String(row[column.accessorKey])
                      : null}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
