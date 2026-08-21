import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const articleController = {
  async getArticles(req: AuthenticatedRequest, res: Response) {
    let articles = Array.from(db.healthArticles.values());

    const category = req.query.category as string;
    const search = req.query.search as string;

    if (category && category !== 'All') {
      articles = articles.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    res.json({
      disclaimer: 'Educational health information is provided for informational and awareness purposes only. Always consult a qualified healthcare provider regarding personal health concerns.',
      articles,
    });
  },

  async getArticleById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const article = db.healthArticles.get(id);

    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    res.json(article);
  },
};
