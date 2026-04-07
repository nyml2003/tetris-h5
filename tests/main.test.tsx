import { beforeEach, describe, expect, it, vi } from "vitest";

const renderMock = vi.hoisted(() => vi.fn());
const createRootMock = vi.hoisted(() => vi.fn(() => ({ render: renderMock })));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));
vi.mock("@/app/shell/App", () => ({
  App: () => null,
}));

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    renderMock.mockReset();
    createRootMock.mockReset();
    createRootMock.mockImplementation(() => ({ render: renderMock }));
  });

  it("mounts the app into #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("@/main");

    expect(createRootMock).toHaveBeenCalledWith(document.getElementById("root"));
    expect(renderMock).toHaveBeenCalledOnce();
  });

  it("throws when #root is missing", async () => {
    document.body.innerHTML = "";

    await expect(import("@/main")).rejects.toThrow(
      "Root element #root was not found."
    );
  });
});

