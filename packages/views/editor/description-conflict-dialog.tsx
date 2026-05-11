"use client";

/**
 * DescriptionConflictDialog — shown on blur when an external update to an
 * issue description landed during the user's focus session AND the user
 * also made local edits that diverge.
 *
 * Three resolutions: keep local, use external, or hand-merge in a textarea.
 * An empty/whitespace-only merge is downgraded to "local" so the user can't
 * silently wipe the description.
 *
 * UI is intentionally minimal for v1 — two side-by-side ReadonlyContent
 * panels, no diff highlighting. Visual polish can land via a follow-up
 * once design owns it.
 */

import { useState } from "react";
import { useT } from "../i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@multica/ui/components/ui/dialog";
import { Button } from "@multica/ui/components/ui/button";
import { Textarea } from "@multica/ui/components/ui/textarea";
import { ReadonlyContent } from "./readonly-content";
import type { ContentEditorResolution } from "./content-editor";

interface DescriptionConflictDialogProps {
  open: boolean;
  local: string;
  external: string;
  onResolve: (resolution: ContentEditorResolution) => void;
}

export function DescriptionConflictDialog({
  open,
  local,
  external,
  onResolve,
}: DescriptionConflictDialogProps) {
  const { t } = useT("editor");
  const [mergeMode, setMergeMode] = useState(false);
  const [mergedDraft, setMergedDraft] = useState(
    () =>
      `<<<<<<< ${"yours"}\n${local}\n=======\n${external}\n>>>>>>> ${"theirs"}\n`,
  );

  function handleSaveMerge() {
    const trimmed = mergedDraft.trim();
    if (trimmed.length === 0) {
      onResolve({ type: "local" });
      return;
    }
    onResolve({ type: "merged", content: mergedDraft });
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t(($) => $.conflict_dialog.title)}</DialogTitle>
          <DialogDescription>
            {t(($) => $.conflict_dialog.description)}
          </DialogDescription>
        </DialogHeader>

        {mergeMode ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={mergedDraft}
              onChange={(e) => setMergedDraft(e.target.value)}
              placeholder={t(($) => $.conflict_dialog.merge_placeholder)}
              className="min-h-[240px] font-mono text-xs"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <section className="rounded-lg border p-3">
              <header className="mb-2 text-xs font-medium text-muted-foreground">
                {t(($) => $.conflict_dialog.your_version)}
              </header>
              <ReadonlyContent content={local} />
            </section>
            <section className="rounded-lg border p-3">
              <header className="mb-2 text-xs font-medium text-muted-foreground">
                {t(($) => $.conflict_dialog.their_version)}
              </header>
              <ReadonlyContent content={external} />
            </section>
          </div>
        )}

        <DialogFooter>
          {mergeMode ? (
            <>
              <Button variant="ghost" onClick={() => setMergeMode(false)}>
                {t(($) => $.conflict_dialog.cancel)}
              </Button>
              <Button onClick={handleSaveMerge}>
                {t(($) => $.conflict_dialog.save_merge)}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onResolve({ type: "local" })}>
                {t(($) => $.conflict_dialog.keep_mine)}
              </Button>
              <Button variant="ghost" onClick={() => onResolve({ type: "external" })}>
                {t(($) => $.conflict_dialog.use_theirs)}
              </Button>
              <Button onClick={() => setMergeMode(true)}>
                {t(($) => $.conflict_dialog.merge_manually)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
