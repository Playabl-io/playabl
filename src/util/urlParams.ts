export type SORT_KEY = "start_time" | "created_at" | "end_time";
export type SORT_DIR = "asc" | "desc";

export const SORT_KEY_PATH = "sort.key";
export const SORT_DIR_PATH = "sort.dir";

export const sortKeys: {
  startTime: SORT_KEY;
  createdAt: SORT_KEY;
  endTime: SORT_KEY;
} = {
  startTime: "start_time",
  createdAt: "created_at",
  endTime: "end_time",
};

export const sortDirs: {
  asc: SORT_DIR;
  desc: SORT_DIR;
} = {
  asc: "asc",
  desc: "desc",
};

export const sortKeyOptions: { label: string; value: SORT_KEY }[] = [
  { label: "Start time", value: sortKeys.startTime },
  { label: "End time", value: sortKeys.endTime },
  { label: "Created at", value: sortKeys.createdAt },
];

export const sortDirOptions: { label: string; value: SORT_DIR }[] = [
  { label: "Ascending", value: sortDirs.asc },
  { label: "Descending", value: sortDirs.desc },
];

export function queryHandlerFactory(defaultOptions: Record<string, string>) {
  const setDefaultQuery = (to: any) => {
    const defaultKeys = Object.keys(defaultOptions);
    if (!defaultKeys.every((key) => to.query[key])) {
      const result = {
        ...to,
        query: {
          ...defaultOptions,
          ...to.query,
        },
      };
      return result;
    }
  };
  return setDefaultQuery;
}

export function translateSortToSupabase({
  sortKey = sortKeys.startTime,
  sortDir = sortDirs.asc,
}: {
  sortKey: SORT_KEY;
  sortDir: SORT_DIR;
}): [SORT_KEY, { ascending: boolean }] {
  return [sortKey, { ascending: sortDir === sortDirs.asc }];
}

export const ensureRouteQueryIsArray = (val: any) => {
  if (Array.isArray(val)) {
    return val;
  }
  return [val];
};
