import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import inquiriesRouter from "./inquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(inquiriesRouter);

export default router;
