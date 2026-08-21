import { Router } from 'express';
import { articleController } from '../controllers/articleController.js';

const router = Router();

// Health education articles are public or authenticated
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticleById);

export default router;
