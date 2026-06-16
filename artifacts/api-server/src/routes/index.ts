import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kundaliRouter from "./kundali";
import geocodeRouter from "./geocode";

const router: IRouter = Router();

router.use(healthRouter);
router.use(kundaliRouter);
router.use(geocodeRouter);

export default router;
