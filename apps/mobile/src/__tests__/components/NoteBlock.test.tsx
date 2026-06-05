import { renderWithProviders, screen } from "../helpers/test-utils";
import { NoteBlock } from "@/components/NoteBlock";

describe("NoteBlock", () => {
  it("does not render blank notes", () => {
    renderWithProviders(<NoteBlock label="Wine notes">{"   "}</NoteBlock>);

    expect(screen.queryByText("Wine notes")).toBeNull();
  });

  it("preserves rendered note text after the blank check", () => {
    renderWithProviders(
      <NoteBlock label="Wine notes">
        {"  Keep the first line\n  Indented"}
      </NoteBlock>,
    );

    expect(screen.getByText("  Keep the first line\n  Indented")).toBeTruthy();
  });
});
