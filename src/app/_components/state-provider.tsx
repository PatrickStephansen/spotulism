"use client";

import { PropsWithChildren } from "react";
import { Provider } from "jotai";

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  return <Provider>{children}</Provider>;
};
