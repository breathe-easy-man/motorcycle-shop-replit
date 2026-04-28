import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import inquiriesRouter from "./inquiries";
import ordersRouter from "./orders";
import locationsRouter from "./locations";
import availabilityRouter from "./availability";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(inquiriesRouter);
router.use(ordersRouter);
router.use(locationsRouter);
router.use(availabilityRouter);

export default router;
