// @vitest-environment jsdom

/**
 * Real Base UI Popover keyboard coverage for the AdditionalMembersPicker
 * trigger pattern used in create-squad.tsx. The sibling test file
 * (`create-squad.test.tsx`) mocks `@multica/ui/components/ui/popover` away to
 * keep behavioural assertions fast — that mock cannot catch the
 * `nativeButton`/keyboard/ARIA wiring on the non-native trigger, which is a
 * reviewer-flagged regression vector.
 *
 * No mock here. We mount a real `<Popover>` with the same render-prop shape as
 * the picker uses and exercise Enter / Space / ArrowDown end-to-end.
 */

import { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@multica/ui/components/ui/popover";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={(v) => setOpen(v)}
    >
      <PopoverTrigger
        nativeButton={false}
        render={
          <div
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            tabIndex={0}
            data-testid="trigger"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                setOpen(true);
              }
            }}
          >
            <span>trigger label</span>
          </div>
        }
      />
      <PopoverContent>
        <div data-testid="popover-content">popover open</div>
      </PopoverContent>
    </Popover>
  );
}

describe("PopoverTrigger keyboard a11y (real Base UI, AdditionalMembersPicker shape)", () => {
  it("renders the trigger as a non-<button> element with combobox semantics", () => {
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");
    // Must NOT be a <button> — nested interactive content (chip remove
    // buttons) would re-introduce the hydration / a11y warning.
    expect(trigger.tagName).toBe("DIV");
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the popover when Enter is pressed on the focused trigger", async () => {
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");
    trigger.focus();

    fireEvent.keyDown(trigger, { key: "Enter" });

    await waitFor(() => {
      expect(screen.queryByTestId("popover-content")).not.toBeNull();
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens the popover when Space is pressed on the focused trigger", async () => {
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");
    trigger.focus();

    // Base UI activates non-native buttons on Space via keyup (matches native
    // <button> behavior), so fire the full key cycle.
    fireEvent.keyDown(trigger, { key: " " });
    fireEvent.keyUp(trigger, { key: " " });

    await waitFor(() => {
      expect(screen.queryByTestId("popover-content")).not.toBeNull();
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens the popover when ArrowDown is pressed (WAI-ARIA combobox pattern)", async () => {
    render(<Harness />);
    const trigger = screen.getByTestId("trigger");
    trigger.focus();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    await waitFor(() => {
      expect(screen.queryByTestId("popover-content")).not.toBeNull();
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
