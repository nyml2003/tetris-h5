import { expect, type Locator } from "@playwright/test";

const GEOMETRY_EPSILON = 1;

interface ElementRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  viewportHeight: number;
  viewportWidth: number;
  width: number;
}

async function readElementRect(locator: Locator): Promise<ElementRect> {
  await expect(locator).toBeVisible();

  return locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();

    return {
      bottom: rect.bottom,
      height: rect.height,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      width: rect.width,
    };
  });
}

interface BoundingBox {
  height: number;
  width: number;
  x: number;
  y: number;
}

async function readBoundingBox(locator: Locator): Promise<BoundingBox> {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();

  if (!box) {
    throw new Error("Expected a visible element to expose a bounding box.");
  }

  return box;
}

export async function expectInViewport(locator: Locator) {
  const rect = await readElementRect(locator);

  expect(rect.left, "Expected element left edge to stay inside the viewport.").toBeGreaterThanOrEqual(
    -GEOMETRY_EPSILON
  );
  expect(rect.top, "Expected element top edge to stay inside the viewport.").toBeGreaterThanOrEqual(
    -GEOMETRY_EPSILON
  );
  expect(
    rect.right,
    "Expected element right edge to stay inside the viewport."
  ).toBeLessThanOrEqual(rect.viewportWidth + GEOMETRY_EPSILON);
  expect(
    rect.bottom,
    "Expected element bottom edge to stay inside the viewport."
  ).toBeLessThanOrEqual(rect.viewportHeight + GEOMETRY_EPSILON);
}

export async function expectNoVerticalOverflow(locator: Locator) {
  const metrics = await locator.evaluate((node) => ({
    clientHeight: node.clientHeight,
    scrollHeight: node.scrollHeight,
  }));

  expect(
    metrics.scrollHeight,
    "Expected element content to fit without vertical overflow."
  ).toBeLessThanOrEqual(metrics.clientHeight + GEOMETRY_EPSILON);
}

export async function expectNoHorizontalOverflow(locator: Locator) {
  const metrics = await locator.evaluate((node) => ({
    clientWidth: node.clientWidth,
    scrollWidth: node.scrollWidth,
  }));

  expect(
    metrics.scrollWidth,
    "Expected element content to fit without horizontal overflow."
  ).toBeLessThanOrEqual(metrics.clientWidth + GEOMETRY_EPSILON);
}

export async function expectNoOverlap(locatorA: Locator, locatorB: Locator) {
  const [boxA, boxB] = await Promise.all([
    readBoundingBox(locatorA),
    readBoundingBox(locatorB),
  ]);

  const overlaps =
    boxA.x + boxA.width > boxB.x + GEOMETRY_EPSILON &&
    boxB.x + boxB.width > boxA.x + GEOMETRY_EPSILON &&
    boxA.y + boxA.height > boxB.y + GEOMETRY_EPSILON &&
    boxB.y + boxB.height > boxA.y + GEOMETRY_EPSILON;

  expect(overlaps, "Expected the two layout regions not to overlap.").toBe(false);
}

export async function expectHeightGreater(locatorA: Locator, locatorB: Locator) {
  const [rectA, rectB] = await Promise.all([
    readElementRect(locatorA),
    readElementRect(locatorB),
  ]);

  expect(rectA.height, "Expected the first element to be taller than the second one.").toBeGreaterThan(
    rectB.height
  );
}

export async function expectHeightRatio(locator: Locator, minRatio: number) {
  const rect = await readElementRect(locator);
  const ratio = rect.height / rect.viewportHeight;

  expect(
    ratio,
    `Expected the element height ratio to be at least ${minRatio.toFixed(2)}.`
  ).toBeGreaterThanOrEqual(minRatio);
}
