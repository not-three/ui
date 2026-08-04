import { expect, test } from "@playwright/test";
import { expectConsole, expectNoConsole, runNote } from "./helpers";

// The errors.md sample: a button whose @click is bound to a method that does
// not exist. It renders fine and clicking is a silent no-op.
const MISSING_HANDLER = `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main>
    <h1>Hello World!</h1>
    <button @click="asd">
      Clicked {{ count }} {{ count === 1 ? 'time' : 'times' }}
    </button>
  </main>
</template>`;

// A missing property read by the TEMPLATE ITSELF. This is the case the dev
// build unlocked: with the previously vendored vue.global.prod.js every
// runtime warning was stripped, so notes like this were completely silent.
const MISSING_PROPERTY = `<template><p>{{ missingProp }}</p></template>
<script>export default { data() { return { count: 0 }; } };</script>`;

const THROWING_LIFECYCLE = `<template><p>x</p></template>
<script>export default { mounted() { throw new Error("boom in mounted"); } };</script>`;

test("vue renders an SFC and warns about a property the template reads but never defines", async ({
  page,
}) => {
  await runNote(page, "vue-sfc", MISSING_PROPERTY);
  // toBeAttached, not toBeVisible: the interpolation resolves to nothing, so
  // the mounted <p> has zero size.
  await expect(page.frameLocator("iframe").locator("p")).toBeAttached({ timeout: 60_000 });
  await expectConsole(
    page,
    "warn",
    '[Vue warn] Property "missingProp" was accessed during render',
  );
});

test("vue surfaces an exception thrown from a lifecycle hook", async ({ page }) => {
  await runNote(page, "vue-sfc", THROWING_LIFECYCLE);
  await expectConsole(page, "error", "boom in mounted");
});

/**
 * Documents a real Vue limitation, verified in this browser rather than
 * assumed: `@click="asd"` compiles to a CACHED inline handler
 *   onClick: _cache[0] || (_cache[0] = function () { return _ctx.asd && _ctx.asd(...arguments); })
 * so `_ctx.asd` is read when the button is clicked, not while rendering.
 * Vue's "Property … was accessed during render" warning is gated on there
 * being a rendering instance, so this case produces no warning in EITHER
 * build, and vue3-sfc-loader exposes no option to turn handler caching off.
 * The note still renders, and the click is simply inert.
 */
test("vue renders the missing-handler sample without errors (the click stays inert)", async ({
  page,
}) => {
  await runNote(page, "vue-sfc", MISSING_HANDLER);
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("h1")).toHaveText("Hello World!", { timeout: 60_000 });
  await frame.locator("button").click();
  await page.waitForTimeout(500);
  await expectNoConsole(page, "error");
});
