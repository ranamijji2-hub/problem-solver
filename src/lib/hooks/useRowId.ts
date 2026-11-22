"use client";

import { useRef } from "react";

/**
 * Returns a function that generates a unique id scoped to one component
 * instance — used for React keys when a calculator lets the user add/
 * remove rows (GPA subjects, CGPA semesters). A ref-based counter avoids
 * relying on array index as a key, which breaks state when a row in the
 * middle of the list is removed.
 */
export function useRowId(prefix: string): () => string {
  const counter = useRef(0);
  return () => {
    counter.current += 1;
    return `${prefix}-${counter.current}`;
  };
}
