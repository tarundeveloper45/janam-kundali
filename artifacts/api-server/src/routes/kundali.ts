import { Router, type IRouter } from "express";
import {
  GenerateKundaliBody,
  GenerateKundaliResponse,
} from "@workspace/api-zod";
import {
  computeKundali,
  computeYogas,
  getTimezoneOffset,
} from "../lib/vedic-astro";

const router: IRouter = Router();

router.post("/kundali/generate", async (req, res): Promise<void> => {
  const parsed = GenerateKundaliBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, date, time, latitude, longitude, timezone, place } = parsed.data;

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const birthDate = new Date(year, month - 1, day, hour, minute);
  const tzOffset = getTimezoneOffset(timezone, birthDate);

  req.log.info({ name, date, time, latitude, longitude, timezone }, "Generating Kundali");

  const kundali = computeKundali(year, month, day, hour, minute, latitude, longitude, tzOffset);
  const yogas = computeYogas(kundali.planets, kundali.ascendant.signIndex);

  const response = {
    birthDetails: { name, date, time, latitude, longitude, timezone, place },
    ascendant: kundali.ascendant,
    planets: kundali.planets.map((p) => ({
      name: p.name,
      nameHindi: p.nameHindi,
      symbol: p.symbol,
      sign: p.sign,
      signIndex: p.signIndex,
      house: p.house,
      degree: p.degree,
      degreeFull: p.degreeFull,
      isRetrograde: p.isRetrograde,
      nakshatra: p.nakshatra,
      nakshatraPada: p.nakshatraPada,
      lord: p.lord,
    })),
    houses: kundali.houses,
    moonSign: kundali.moonSign,
    sunSign: kundali.sunSign,
    nakshatra: {
      name: kundali.nakshatra.name,
      pada: kundali.nakshatra.pada,
      lord: kundali.nakshatra.lord,
      deity: kundali.nakshatra.deity,
      symbol: kundali.nakshatra.symbol,
    },
    yogas,
  };

  const validated = GenerateKundaliResponse.safeParse(response);
  if (!validated.success) {
    req.log.error({ error: validated.error.message }, "Response validation failed");
    res.status(500).json({ error: "Internal calculation error" });
    return;
  }

  res.json(validated.data);
});

export default router;
