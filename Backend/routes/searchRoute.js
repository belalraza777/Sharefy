import express from 'express';
import { search } from '../controllers/searchController.js';
import verifyAuth from '../middlewares/verifyAuth.js';
import asyncWrapper from "../utils/asyncWrapper.js";

const router = express.Router();

router.get('/', verifyAuth, asyncWrapper(search));

export default router;
