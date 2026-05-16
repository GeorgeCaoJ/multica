import reactConfig from "@multica/eslint-config/react";
import i18next from "eslint-plugin-i18next";

// Global i18n protection. Every JSX text node in this package must pass
// through useT() — raw strings become a build error. Scope of
// `mode: "jsx-text-only"`: flags raw strings inside JSX children only;
// attribute values and plain TS literals are allowed through.

export default [
  ...reactConfig,
  {
    files: ["**/*.tsx"],
    ignores: ["**/*.test.tsx", "test/**"],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        { mode: "jsx-text-only" },
      ],
    },
  },
  // RFC v6.1 §A5: the legacy `useT("runtimes")` namespace is reserved for
  // code under `packages/views/runtimes/` only. Computer-related strings
  // (and any new code outside the legacy runtime list/detail surface)
  // must use the `computers` namespace — or a shared one like `common` —
  // so we end up with one canonical home per concept. Stops drift like
  // "Runtimes" appearing as a sidebar label after the rename, and keeps
  // future contributors from extending the legacy namespace by accident.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "runtimes/**",
      "**/*.test.{ts,tsx}",
      "test/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='useT'][arguments.0.value='runtimes']",
          message:
            "useT(\"runtimes\") is reserved for the legacy `packages/views/runtimes/` surface (RFC v6.1 §A5). New strings belong in `computers` (or `common` for cross-feature copy) — see packages/views/locales/.",
        },
      ],
    },
  },
];
