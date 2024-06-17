import type { HTMLAttributes, JSXChildren } from '@builder.io/qwik';

type HAttr<T extends Element> = { children: JSXChildren } & HTMLAttributes<T>;

export const Table = (props: HAttr<HTMLTableElement>) => <table {...props} />;
export const Th = (props: HAttr<HTMLTableCellElement>) => <th {...props} />;
export const Td = (props: HAttr<HTMLTableCellElement>) => <td {...props} />;
