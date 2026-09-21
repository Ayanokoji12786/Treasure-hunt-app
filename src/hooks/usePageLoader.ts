import { useState } from "react";

/**
 * Keeps a <LoadingScreen> mounted through its finish + zoom-out sequence even after
 * the real `active` condition it was covering turns false — the screen itself calls
 * `hide` (as `onDone`) once that exit animation completes.
 */
export function usePageLoader() {
  const [visible, setVisible] = useState(true);
  return { loaderVisible: visible, hideLoader: () => setVisible(false) };
}
