import { expect, test } from "@playwright/test";

import {
  expectInViewport,
  expectNoOverlap,
  expectNoVerticalOverflow,
} from "./helpers/layout";
import {
  actionButton,
  expectPath,
  gameScreen,
  helpActions,
  helpScreen,
  homeActions,
  homeCard,
  homeScreen,
  labels,
} from "./helpers/routes";

test("renders the home entry screen without overlap or overflow", async ({ page }) => {
  await page.goto("/");
  await expectPath(page, "/");
  await expect(homeScreen(page)).toBeVisible();

  const actions = homeActions(page);

  await expect(actionButton(actions, labels.home.start)).toBeVisible();
  await expect(actionButton(actions, labels.home.ai)).toBeVisible();
  await expect(actionButton(actions, labels.home.help)).toBeVisible();

  await expectInViewport(homeCard(page));
  await expectInViewport(actions);
  await expectNoVerticalOverflow(homeScreen(page));
  await expectNoOverlap(homeCard(page), actions);
});

test("supports the documented home navigation entry points", async ({ page }) => {
  await page.goto("/");
  await homeCard(page).click({ position: { x: 24, y: 24 } });
  await page.keyboard.press("KeyH");

  await expectPath(page, "/help");
  await expect(helpScreen(page)).toBeVisible();

  await actionButton(helpActions(page), labels.help.home).click();
  await expectPath(page, "/");

  await actionButton(homeActions(page), labels.home.start).click();
  await expectPath(page, "/play");
  await expect(gameScreen(page)).toBeVisible();
});
