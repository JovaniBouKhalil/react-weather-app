import { test, expect } from "@playwright/test";

// Deterministic API responses test UI behavior without depending on today's weather.
const forecast = {
  current: { time: "2026-10-29T14:00", temperature_2m: 24.4, apparent_temperature: 25.1,
    relative_humidity_2m: 62, wind_speed_10m: 12.3, weather_code: 0, is_day: 1 },
  daily: { time: ["2026-10-29", "2026-10-30", "2026-10-31"], weather_code: [0, 2, 61],
    temperature_2m_max: [26, 25, 23], temperature_2m_min: [19, 18, 17] }
};

async function mockWeather(page) {
  await page.route("https://geocoding-api.open-meteo.com/**", route => {
    const city = new URL(route.request().url()).searchParams.get("name");
    return route.fulfill({ json: { results: [{ name: city, country: "Lebanon", latitude: 33.89, longitude: 35.5 }] } });
  });
  await page.route("https://api.open-meteo.com/**", route => route.fulfill({ json: forecast }));
}

test("opens cleanly and validates blank, whitespace, and short input without fetching", async ({ page }) => {
  const errors = [];
  const requests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => { if (request.url().includes("open-meteo.com")) requests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByText("Your next view starts here.")).toBeVisible();
  for (const query of ["", "   ", "B"]) {
    await page.getByLabel("City name").fill(query);
    await page.getByRole("button", { name: "Check weather" }).click();
    await expect(page.getByRole("alert")).toContainText("at least two characters");
    await expect(page.getByLabel("City name")).toHaveAttribute("aria-invalid", "true");
  }
  expect(requests).toHaveLength(0);
  expect(errors).toEqual([]);
});

test("Enter submits a trimmed city, displays live details, and replaces old forecast cards", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/");
  await page.getByLabel("City name").fill("  Beirut  ");
  await page.getByLabel("City name").press("Enter");
  await expect(page.getByRole("heading", { name: "Beirut", exact: true })).toBeVisible();
  await expect(page.locator(".temperature")).toHaveText("24°C");
  await expect(page.locator(".detail-row")).toContainText(["25°C", "62%", "12 km/h"]);
  await expect(page.locator(".forecast-card")).toHaveCount(3);
  await page.getByRole("button", { name: "London" }).click();
  await expect(page.getByRole("heading", { name: "London", exact: true })).toBeVisible();
  await expect(page.locator(".forecast-card")).toHaveCount(3);
  await expect(page.getByLabel("City name")).toHaveValue("London");
});

test("loading disables duplicate submissions and recovers on success", async ({ page }) => {
  await mockWeather(page);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route("https://api.open-meteo.com/**", async route => {
    await pending;
    await route.fulfill({ json: forecast });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Beirut" }).click();
  await expect(page.getByText("Looking up weather for Beirut…")).toBeVisible();
  await expect(page.getByLabel("City name")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Tokyo" })).toBeDisabled();
  release();
  await expect(page.getByRole("heading", { name: "Beirut", exact: true })).toBeVisible();
  await expect(page.getByLabel("City name")).toBeEnabled();
});

test("unknown city errors can retry the same city successfully", async ({ page }) => {
  await mockWeather(page);
  await page.route("https://geocoding-api.open-meteo.com/**", route => route.fulfill({ json: {} }), { times: 1 });
  await page.goto("/");
  await page.getByRole("button", { name: "Beirut" }).click();
  await expect(page.getByRole("alert")).toContainText("couldn't find");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Beirut", exact: true })).toBeVisible();
});

for (const failure of ["network", "rate-limit", "server", "incomplete"]) {
  test(`handles ${failure} failure without an uncaught error`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await mockWeather(page);
    await page.route("https://api.open-meteo.com/**", route => {
      if (failure === "network") return route.abort();
      if (failure === "incomplete") return route.fulfill({ json: { current: {} } });
      return route.fulfill({ status: failure === "rate-limit" ? 429 : 503, json: {} });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Beirut" }).click();
    const message = { network: "internet connection", "rate-limit": "Too many requests", server: "temporarily unavailable", incomplete: "incomplete data" }[failure];
    await expect(page.getByRole("alert")).toContainText(message);
    await expect(page.getByLabel("City name")).toBeEnabled();
    expect(errors).toEqual([]);
  });
}

test("timeout restores controls and a retry ignores the abandoned response", async ({ page }) => {
  await mockWeather(page);
  await page.clock.install();
  await page.route("https://api.open-meteo.com/**", () => {}, { times: 1 });
  await page.goto("/");
  const weatherRequest = page.waitForRequest("https://api.open-meteo.com/**");
  await page.getByRole("button", { name: "Beirut" }).click();
  await weatherRequest;
  await page.clock.fastForward(15001);
  await expect(page.getByRole("alert")).toContainText("took too long");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Beirut", exact: true })).toBeVisible();
});

for (const width of [320, 390, 768, 1440]) {
  test(`weather results fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockWeather(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Beirut" }).click();
    await expect(page.locator(".forecast-card")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
