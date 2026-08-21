import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const providerController = {
  async getProviders(req: AuthenticatedRequest, res: Response) {
    let providers = Array.from(db.providerProfiles.values());

    const specialty = req.query.specialty as string;
    const clinicId = req.query.clinicId as string;
    const search = req.query.search as string;

    if (specialty) {
      providers = providers.filter((p) => p.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    if (clinicId) {
      providers = providers.filter((p) => p.clinicId === clinicId);
    }
    if (search) {
      const q = search.toLowerCase();
      providers = providers.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q)
      );
    }

    res.json(providers);
  },

  async getProviderById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const provider = db.providerProfiles.get(id);

    if (!provider) {
      res.status(404).json({ error: 'Healthcare provider not found.' });
      return;
    }

    res.json(provider);
  },
};
