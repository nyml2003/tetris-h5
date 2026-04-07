import type { HelpSection } from "@/app/shell/types";

export function paginateHelpSections(
  sections: readonly HelpSection[],
  pageSize: number
): HelpSection[][] {
  const pages: HelpSection[][] = [];

  for (let index = 0; index < sections.length; index += pageSize) {
    pages.push(sections.slice(index, index + pageSize));
  }

  return pages;
}
