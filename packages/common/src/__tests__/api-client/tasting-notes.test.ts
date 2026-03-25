import { describe, it, expect, vi, beforeEach } from "vitest";
import { tastingNotesResource } from "../../resources/tasting-notes";
import type { RequestFn } from "../../types";

describe("tastingNotesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let tastingNotes: ReturnType<typeof tastingNotesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    tastingNotes = tastingNotesResource(mockRequest);
  });

  it("getAll calls GET tasting-note", async () => {
    await tastingNotes.getAll();
    expect(mockRequest).toHaveBeenCalledWith("tasting-note", "GET");
  });

  it("getByVintageId calls GET tasting-note/vintage/{id}", async () => {
    await tastingNotes.getByVintageId(3);
    expect(mockRequest).toHaveBeenCalledWith("tasting-note/vintage/3", "GET");
  });

  it("getByWineId calls GET tasting-note/wine/{id}", async () => {
    await tastingNotes.getByWineId(5);
    expect(mockRequest).toHaveBeenCalledWith("tasting-note/wine/5", "GET");
  });

  it("getById calls GET tasting-note/{id}", async () => {
    await tastingNotes.getById(1);
    expect(mockRequest).toHaveBeenCalledWith("tasting-note/1", "GET");
  });

  it("create coerces vintageId and score to numbers", async () => {
    const data = {
      vintageId: "3" as any,
      score: "90" as any,
      notes: "Excellent wine",
    };
    await tastingNotes.create(data as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.vintageId).toBe(3);
    expect(body.score).toBe(90);
    expect(body.notes).toBe("Excellent wine");
  });

  it("update calls PUT tasting-note/{id} with data", async () => {
    const data = { score: 85, notes: "Updated notes" };
    await tastingNotes.update(7, data as any);

    expect(mockRequest).toHaveBeenCalledWith(
      "tasting-note/7",
      "PUT",
      JSON.stringify(data),
    );
  });

  it("delete calls DELETE tasting-note/{id}", async () => {
    await tastingNotes.delete(7);
    expect(mockRequest).toHaveBeenCalledWith("tasting-note/7", "DELETE");
  });
});
