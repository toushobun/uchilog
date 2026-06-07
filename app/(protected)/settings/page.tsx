import { loadSettingsView } from "server/loaders/settings";
import { SettingsPage as SettingsPageView } from "settings-page/SettingsPage";

export default async function SettingsPage() {
  const view = await loadSettingsView();

  return <SettingsPageView {...view} />;
}
