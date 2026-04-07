import { expect, test } from "@playwright/test";

import {
  expectInViewport,
  expectNoHorizontalOverflow,
} from "./helpers/layout";
import {
  actionButton,
  aiBadge,
  expectPath,
  gameScreen,
  helpActions,
  helpCards,
  helpGrid,
  helpPagination,
  helpPaginationStatus,
  helpPanel,
  helpScreen,
  labels,
} from "./helpers/routes";

test("keeps the help cards inside the layout and paginates correctly", async ({ page }) => {
  await page.goto("/help");
  await expectPath(page, "/help");
  await expect(helpScreen(page)).toBeVisible();

  await expectInViewport(helpPanel(page));
  await expectNoHorizontalOverflow(helpGrid(page));
  await expect(helpCards(page)).toHaveCount(4);

  const cardCount = await helpCards(page).count();

  for (let index = 0; index < cardCount; index += 1) {
    await expectInViewport(helpCards(page).nth(index));
  }

  const pagination = helpPagination(page);

  await expect(helpPaginationStatus(page)).toHaveText("第 1 / 2 页");
  await expect(actionButton(pagination, labels.help.previous)).toBeDisabled();
  await expect(actionButton(pagination, labels.help.next)).toBeEnabled();

  await actionButton(pagination, labels.help.next).click();

  await expect(helpPaginationStatus(page)).toHaveText("第 2 / 2 页");
  await expect(helpCards(page)).toHaveCount(2);
  await expect(actionButton(pagination, labels.help.previous)).toBeEnabled();
  await expect(actionButton(pagination, labels.help.next)).toBeDisabled();
});

test("restores help state from browser history and supports AI entry", async ({ page }) => {
  await page.goto("/help");
  await actionButton(helpPagination(page), labels.help.next).click();
  await actionButton(helpActions(page), labels.help.home).click();

  await expectPath(page, "/");

  await page.goBack();

  await expectPath(page, "/help");
  await expect(helpPaginationStatus(page)).toHaveText("第 2 / 2 页");

  await page.keyboard.press("KeyA");

  await expectPath(page, "/play");
  await expect(gameScreen(page)).toBeVisible();
  await expect(aiBadge(page)).toHaveText(labels.game.aiBadge);
});
