"use client";
import { createContext, useContext } from "react";

export const ShellContext = createContext({ wins: [], actions: null });

export const useShell = () => useContext(ShellContext);
