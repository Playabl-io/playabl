export type SORT_KEY = "start_time" | "created_at" | "end_time";
export type SORT_DIR = "asc" | "desc";

export enum SORT_QUERY_VALUES {
  startTimeAsc = "start-time-asc",
  startTimeDesc = "start-time-desc",
  createdTimeAsc = "created-time-asc",
  createdTimeDesc = "created-time-desc",
}

export const SORT_OPTIONS = {
  startTimeAsc: "start-time-asc",
  startTimeDesc: "start-time-desc",
  createdTimeAsc: "created-time-asc",
  createdTimeDesc: "created-time-desc",
};

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

export function translateSortToSupabase(
  option: SORT_QUERY_VALUES
): [SORT_KEY, { ascending: boolean }] {
  switch (option) {
    case SORT_QUERY_VALUES.startTimeDesc:
      return ["start_time", { ascending: false }];
    case SORT_QUERY_VALUES.startTimeAsc:
    default:
      return ["start_time", { ascending: true }];
  }
}
