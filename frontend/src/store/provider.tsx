"use client";

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { store } from "./index";

export function StoreProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
