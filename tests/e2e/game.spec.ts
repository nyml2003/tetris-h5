import { expect, test } from "@playwright/test";

import {
  expectHeightGreater,
  expectHeightRatio,
  expectInViewport,
  expectNoOverlap,
} from "./helpers/layout";
import {
  actionButton,
  aiBadge,
  controlButton,
  expectPath,
  gameFooter,
  gameScreen,
  gameStage,
  gameTopbar,
  homeActions,
  labels,
  settingsActions,
  settingsScreen,
} from "./helpers/routes";

test("keeps the play layout stable and supports pause and resume", async ({ page }) => {
  await page.goto("/play");
  await expectPath(page, "/play");
  await expect(gameScreen(page)).toBeVisible();

  await expectInViewport(gameTopbar(page));
  await expectInViewport(gameStage(page));
  await expectInViewport(gameFooter(page));
  await expectNoOverlap(gameTopbar(page), gameStage(page));
  await expectNoOverlap(gameStage(page), gameFooter(page));
  await expectHeightGreater(gameStage(page), gameTopbar(page));
  await expectHeightGreater(gameStage(page), gameFooter(page));
  await expectHeightRatio(gameStage(page), 0.35);

  await page.keyboard.press("Escape");

  await expectPath(page, "/play");
  await expect(settingsScreen(page)).toBeVisible();
  await expect(actionButton(settingsActions(page), labels.settings.resume)).toBeVisible();
  await expect(actionButton(settingsActions(page), labels.settings.restart)).toBeVisible();

  await page.keyboard.press("Enter");

  await expectPath(page, "/play");
  await expect(gameScreen(page)).toBeVisible();
});

test("locks manual controls in AI mode and allows taking over the game", async ({ page }) => {
  await page.goto("/");
  await actionButton(homeActions(page), labels.home.ai).click();

  await expectPath(page, "/play");
  await expect(aiBadge(page)).toHaveText(labels.game.aiBadge);
  await expect(controlButton(page, "左移")).toBeDisabled();
  await expect(controlButton(page, "右移")).toBeDisabled();
  await expect(controlButton(page, "旋转")).toBeDisabled();

  await page.keyboard.press("KeyP");

  await expect(settingsScreen(page)).toBeVisible();
  await expect(actionButton(settingsActions(page), labels.settings.takeOver)).toBeVisible();

  await actionButton(settingsActions(page), labels.settings.takeOver).click();

  await expect(gameScreen(page)).toBeVisible();
  await expect(aiBadge(page)).toHaveCount(0);
  await expect(controlButton(page, "左移")).toBeEnabled();
  await expect(controlButton(page, "旋转")).toBeEnabled();
});
