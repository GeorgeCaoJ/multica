import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { I18nProvider } from "@multica/core/i18n/react";
import enEditor from "../locales/en/editor.json";

vi.mock("./readonly-content", () => ({
  ReadonlyContent: ({ content }: { content: string }) => (
    <div data-testid="readonly">{content}</div>
  ),
}));

import { DescriptionConflictDialog } from "./description-conflict-dialog";

const TEST_RESOURCES = { en: { editor: enEditor } };

function I18nWrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider locale="en" resources={TEST_RESOURCES}>
      {children}
    </I18nProvider>
  );
}

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof DescriptionConflictDialog>> = {},
) {
  const onResolve = vi.fn();
  const ui: ReactElement = (
    <DescriptionConflictDialog
      open
      local="LOCAL"
      external="EXTERNAL"
      onResolve={onResolve}
      {...overrides}
    />
  );
  const utils = render(ui, { wrapper: I18nWrapper });
  return { onResolve, ...utils };
}

describe("DescriptionConflictDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders both sides as readonly markdown", () => {
    renderDialog();
    const rendered = screen.getAllByTestId("readonly").map((n) => n.textContent);
    expect(rendered).toContain("LOCAL");
    expect(rendered).toContain("EXTERNAL");
  });

  it("Keep mine → resolves with { type: 'local' }", () => {
    const { onResolve } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /keep mine/i }));
    expect(onResolve).toHaveBeenCalledWith({ type: "local" });
  });

  it("Use theirs → resolves with { type: 'external' }", () => {
    const { onResolve } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /use theirs/i }));
    expect(onResolve).toHaveBeenCalledWith({ type: "external" });
  });

  it("Merge manually → opens textarea; Save merge → resolves with merged content", () => {
    const { onResolve } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /merge manually/i }));

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    fireEvent.change(textarea, { target: { value: "merged final content" } });
    fireEvent.click(screen.getByRole("button", { name: /save merge/i }));

    expect(onResolve).toHaveBeenCalledWith({
      type: "merged",
      content: "merged final content",
    });
  });

  it("Save merge with whitespace-only content → resolves as 'local' (avoid silent wipe)", () => {
    const { onResolve } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /merge manually/i }));
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "   \n  " } });
    fireEvent.click(screen.getByRole("button", { name: /save merge/i }));
    expect(onResolve).toHaveBeenCalledWith({ type: "local" });
  });
});
