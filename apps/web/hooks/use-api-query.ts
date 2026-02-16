import { useQuery, UseQueryOptions, UseQueryResult, skipToken } from "@tanstack/react-query";
import { ApiResult, ApiQueryError } from "@/lib/api/types";

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiQueryError>,
  "queryFn"
> & {
  queryFn: (() => Promise<ApiResult<T>>) | typeof skipToken;
};

export type UseApiQueryResult<T> = UseQueryResult<T, ApiQueryError>;

export function useApiQuery<T>(
  options: UseApiQueryOptions<T>
): UseApiQueryResult<T> {
  const { queryFn, ...rest } = options;

  const wrappedQueryFn =
    queryFn === skipToken
      ? skipToken
      : async (): Promise<T> => {
          const result = await queryFn();
          if (!result.ok) {
            throw new ApiQueryError(result.error);
          }
          return result.data;
        };

  return useQuery<T, ApiQueryError>({
    ...rest,
    queryFn: wrappedQueryFn,
  });
}
