import { describe, expect, it } from "vitest";
import { createI18n } from "@multica/core/i18n/react";
import enAutopilots from "../../locales/en/autopilots.json";
import zhAutopilots from "../../locales/zh-Hans/autopilots.json";

// Contract test for the autopilot-dialog partial-success i18n keys.
//
// These keys are interpolated via `t(($) => $.dialog.toast_*_with_reason,
// { reason })`. i18next requires DOUBLE-brace placeholders (`{{reason}}`).
// A previous draft used single braces, which renders the literal string
// `{reason}` to the user — exactly the bug the issue is meant to fix.
//
// We instantiate real i18next here (not a mock) so any future regression
// in either the JSON template or the call-site variable name fails this
// test with a substring assertion.

describe("autopilot dialog partial-success i18n", () => {
  const reason = "schedule conflict: 09:00 overlaps existing trigger";

  describe("en", () => {
    const i18n = createI18n("en", { en: { autopilots: enAutopilots } });
    const tFn = i18n.getFixedT("en", "autopilots");
    // The repo's `t` is typed as selector-only (enableSelector: true). We
    // call it as `t(selector, opts)` to mirror what the dialog does.
    const t = tFn as unknown as (
      selector: (src: typeof enAutopilots) => string,
      opts?: Record<string, unknown>,
    ) => string;

    it("interpolates reason into the create partial-success key", () => {
      const rendered = t(($) => $.dialog.toast_create_partial_with_reason, { reason });
      expect(rendered).toContain(reason);
      expect(rendered).not.toContain("{{");
      expect(rendered).not.toContain("{reason}");
    });

    it("interpolates reason into the update partial-success key", () => {
      const rendered = t(($) => $.dialog.toast_update_partial_with_reason, { reason });
      expect(rendered).toContain(reason);
      expect(rendered).not.toContain("{{");
      expect(rendered).not.toContain("{reason}");
    });

    it("keeps the no-reason create fallback unchanged", () => {
      expect(t(($) => $.dialog.toast_create_partial)).toBe(
        "Autopilot created, but schedule failed to save",
      );
    });

    it("keeps the no-reason update fallback unchanged", () => {
      expect(t(($) => $.dialog.toast_update_partial)).toBe(
        "Autopilot updated, but schedule failed to save",
      );
    });
  });

  describe("zh-Hans", () => {
    const i18n = createI18n("zh-Hans", {
      "zh-Hans": { autopilots: zhAutopilots },
      en: { autopilots: enAutopilots },
    });
    const tFn = i18n.getFixedT("zh-Hans", "autopilots");
    const t = tFn as unknown as (
      selector: (src: typeof zhAutopilots) => string,
      opts?: Record<string, unknown>,
    ) => string;

    it("interpolates reason into the create partial-success key", () => {
      const rendered = t(($) => $.dialog.toast_create_partial_with_reason, { reason });
      expect(rendered).toContain(reason);
      expect(rendered).not.toContain("{{");
      expect(rendered).not.toContain("{reason}");
    });

    it("interpolates reason into the update partial-success key", () => {
      const rendered = t(($) => $.dialog.toast_update_partial_with_reason, { reason });
      expect(rendered).toContain(reason);
      expect(rendered).not.toContain("{{");
      expect(rendered).not.toContain("{reason}");
    });
  });
});
