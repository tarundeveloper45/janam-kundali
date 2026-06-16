import { Router, type IRouter } from "express";
import {
  SearchPlacesQueryParams,
  SearchPlacesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
  admin2?: string;
  timezone: string;
  population?: number;
}

router.get("/geocode/search", async (req, res): Promise<void> => {
  const parsed = SearchPlacesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q } = parsed.data;

  if (!q || q.trim().length < 2) {
    res.json([]);
    return;
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=8&language=en&format=json`;
    const response = await fetch(url, {
      headers: { "User-Agent": "JanamKundali/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "Geocoding API error");
      res.json([]);
      return;
    }

    const data = (await response.json()) as { results?: OpenMeteoResult[] };
    const results = data.results ?? [];

    const places = results.map((r) => ({
      name: r.name,
      country: r.country || r.country_code || "",
      state: r.admin1 ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));

    const validated = SearchPlacesResponse.safeParse(places);
    if (!validated.success) {
      req.log.error({ error: validated.error.message }, "Places validation failed");
      res.json(places);
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Geocoding request failed");
    res.json([]);
  }
});

export default router;
