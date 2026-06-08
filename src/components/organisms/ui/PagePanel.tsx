import type { ComponentProps } from "react";

import { PageCard } from "ui-molecules/PageCard";

type PagePanelProps = ComponentProps<typeof PageCard>;

export function PagePanel(props: PagePanelProps) {
  return <PageCard {...props} />;
}
