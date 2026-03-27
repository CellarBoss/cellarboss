import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useGlobalSearchParams, useRouter } from "expo-router";

type NavigationHistoryContextValue = {
  goBack: () => void;
  canGoBack: boolean;
};

const NavigationHistoryContext =
  createContext<NavigationHistoryContextValue | null>(null);

export function NavigationHistoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [history, setHistory] = useState<string[]>([]);
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const router = useRouter();
  const isGoingBack = useRef(false);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    if (isGoingBack.current) {
      isGoingBack.current = false;
      return;
    }

    const queryParams = Object.entries(paramsRef.current).filter(
      ([k]) => k !== "id",
    );
    const qs = queryParams
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join("&");
    const fullPath = qs ? `${pathname}?${qs}` : pathname;

    setHistory((prev) =>
      prev[prev.length - 1] === fullPath ? prev : [...prev, fullPath],
    );
  }, [pathname]);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, -1);
      const prevPath = newHistory[newHistory.length - 1];
      if (prevPath) {
        isGoingBack.current = true;
        router.navigate(prevPath as any);
      } else {
        router.back();
      }
      return newHistory;
    });
  }, [router]);

  return (
    <NavigationHistoryContext.Provider
      value={{ goBack, canGoBack: history.length > 1 }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useNavigationHistory(): NavigationHistoryContextValue {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) {
    throw new Error(
      "useNavigationHistory must be used within <NavigationHistoryProvider>",
    );
  }
  return ctx;
}
