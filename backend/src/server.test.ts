import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { invokeJson } from './test-utils.js';
import type { WeatherSnapshot } from './weather.js';

const weather: WeatherSnapshot = {
  condition: 'Sunny',
  observed_at: '2026-05-04T00:00:00Z',
  source: 'test',
  area: 'Orchard',
  valid_period_text: 'Now',
  temperature_c: 31,
  humidity_percent: 70,
  rainfall_mm: 0,
  wind_speed_knots: 5,
  wind_direction_degrees: 90,
  forecast_low_c: 28,
  forecast_high_c: 33,
  uv_index: 10,
  psi_twenty_four_hourly: 40,
  pm25_one_hourly: 8,
  air_quality_region: 'central',
  forecast_periods: [{ label: 'Now', forecast: 'Sunny' }],
  daily_forecast: [
    { date: '2026-05-04', forecast: 'Sunny', temperature_low_c: 28, temperature_high_c: 33 },
  ],
};

describe('backend API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('./server.js').createApp>>;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-server-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('./server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
      weatherClient: {
        async getCurrentWeather() {
          return weather;
        },
      },
    });
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('reports health', async () => {
    const response = await invokeJson(app, {
      method: 'GET',
      path: '/health',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });

  it('accepts frontend logs payloads', async () => {
    const response = await invokeJson(app, {
      method: 'POST',
      path: '/api/logs',
      body: {
        event: 'ui.click',
        metadata: { action: 'open-panel' },
        page: '/dashboard',
      },
    });
    expect(response.status).toBe(204);
  });

  it('rejects invalid frontend logs payloads', async () => {
    const response = await invokeJson(app, {
      method: 'POST',
      path: '/api/logs',
      body: { event: 'INVALID' },
    });
    expect(response.status).toBe(422);
    expect(response.body).toEqual({ detail: 'event is required' });
  });

  it('validates Singapore coordinates when creating locations', async () => {
    const response = await invokeJson(app, {
      method: 'POST',
      path: '/api/locations',
      body: { latitude: 2, longitude: 103.85 },
    });

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      detail: 'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
    });
  });

  it('creates, fetches, refreshes, and deletes locations', async () => {
    const createdResponse = await invokeJson(app, {
      method: 'POST',
      path: '/api/locations',
      body: { latitude: 1.3, longitude: 103.8 },
    });

    expect(createdResponse.status).toBe(201);
    const created = createdResponse.body as {
      id: number;
      latitude: number;
      longitude: number;
      weather: { condition: string; area: string; temperature_c: number };
    };
    expect(created).toMatchObject({
      id: 1,
      latitude: 1.3,
      longitude: 103.8,
      weather: {
        condition: 'Sunny',
        area: 'Orchard',
      },
    });

    const fetchedResponse = await invokeJson(app, {
      method: 'GET',
      path: '/api/locations/1',
    });
    expect(fetchedResponse.status).toBe(200);
    expect(fetchedResponse.body).toMatchObject({
      id: 1,
      weather: {
        condition: 'Sunny',
      },
    });

    const refreshedResponse = await invokeJson(app, {
      method: 'POST',
      path: '/api/locations/1/refresh',
    });
    expect(refreshedResponse.status).toBe(200);
    expect((refreshedResponse.body as { weather: { condition: string; temperature_c: number } })
      .weather).toMatchObject({
      condition: 'Sunny',
      temperature_c: 31,
    });

    expect(
      (
        await invokeJson(app, {
          method: 'DELETE',
          path: '/api/locations/1',
        })
      ).status,
    ).toBe(204);
    expect((await invokeJson(app, { method: 'GET', path: '/api/locations/1' })).status).toBe(404);
    const listResponse = await invokeJson(app, { method: 'GET', path: '/api/locations' });
    expect(listResponse.status).toBe(200);
    expect((listResponse.body as { locations: unknown[] }).locations).toEqual([]);
  });

  it('returns not found for missing locations', async () => {
    expect((await invokeJson(app, { method: 'GET', path: '/api/locations/999' })).status).toBe(404);
    expect((await invokeJson(app, { method: 'DELETE', path: '/api/locations/999' })).status).toBe(
      404,
    );
    expect(
      (await invokeJson(app, { method: 'POST', path: '/api/locations/999/refresh' })).status,
    ).toBe(404);
  });
});
