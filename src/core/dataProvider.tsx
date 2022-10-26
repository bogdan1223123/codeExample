import { createContext, ReactNode } from "react";
import { LoadingScreen } from "../ui/LoadingScreen ";
import { useAuth } from "./hooks/useAuth";
import { InitialDataType, useInitialData } from "./hooks/useInitialData";
import { useLoading } from "./hooks/useLoading";
import { useNotification } from "./hooks/useNotification";
import { useShop } from "./hooks/useShop";

export type DataContextType = ReturnType<typeof useInitialData> &
  ReturnType<typeof useAuth> &
  ReturnType<typeof useShop> &
  ReturnType<typeof useLoading> &
  ReturnType<typeof useNotification>;

export const DataContext = createContext<DataContextType>({} as DataContextType);

type Props = {
  value?: InitialDataType;
  children: ReactNode;
};

export const DataProvider = ({ children, value }: Props) => {
  const initialDataValue = useInitialData({ value });
  const shopValue = useShop({});
  const authValue = useAuth({});
  const loadingValue = useLoading();
  const notification = useNotification();

  return (
    <DataContext.Provider value={{ ...initialDataValue, ...authValue, ...shopValue, ...loadingValue, ...notification }}>
      {children}
      {loadingValue.loading ? <LoadingScreen /> : null}
    </DataContext.Provider>
  );
};
