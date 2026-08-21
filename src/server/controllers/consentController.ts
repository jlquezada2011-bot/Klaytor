import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { consentToggleSchema } from '../validators/index.js';
import type { ConsentRecord } from '../../types/index.js';

export const consentController = {
  async getConsent(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const records = Array.from(db.consentRecords.values()).filter((c) => c.userId === req.user?.id);

    // If empty for this user, populate standard defaults
    if (records.length === 0) {
      const now = new Date().toISOString();
      const standardTypes = [
        { type: 'DATA_PROCESSING', desc: 'Electronic processing and secure cloud storage of medical health records.' },
        { type: 'TELEHEALTH_COMMUNICATION', desc: 'Asynchronous provider messaging and remote clinical consultations.' },
        { type: 'LAB_DATA_SHARING', desc: 'Laboratory diagnostic reports integration with patient chart.' },
        { type: 'AUDIT_LOG_TRACKING', desc: 'Security audit logging and unauthorized intrusion prevention monitoring.' },
      ];
      standardTypes.forEach((st) => {
        const item: ConsentRecord = {
          id: `con_${Date.now()}_${st.type}`,
          userId: req.user!.id,
          consentType: st.type,
          description: st.desc,
          granted: true,
          termsVersion: 'v1.4',
          updatedAt: now,
        };
        db.consentRecords.set(`${req.user!.id}_${st.type}`, item);
        records.push(item);
      });
    }

    res.json({
      governanceInfo: {
        privacyPolicyVersion: '1.4 (2026 Edition)',
        dataProtectionPrinciples: [
          'Minimal data collection necessary for healthcare coordination.',
          'Strict Role-Based Access Control preventing unauthorized record viewing.',
          'End-to-end audit logging for all record interactions.',
          'Explicit user rights to review, withdraw consent, and request data export.',
        ],
        emergencyNotice: 'Consent settings do not restrict essential emergency care or statutory disease reporting required by law.',
      },
      consentRecords: records,
    });
  },

  async toggleConsent(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parsed = consentToggleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const key = `${req.user.id}_${parsed.data.consentType}`;
    let record = db.consentRecords.get(key);
    const now = new Date().toISOString();

    if (!record) {
      record = {
        id: `con_${Date.now()}`,
        userId: req.user.id,
        consentType: parsed.data.consentType,
        description: 'User-specified consent setting',
        granted: parsed.data.granted,
        termsVersion: 'v1.4',
        ipAddress: req.ip,
        updatedAt: now,
      };
    } else {
      record.granted = parsed.data.granted;
      record.ipAddress = req.ip;
      record.updatedAt = now;
    }

    db.consentRecords.set(key, record);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CONSENT_MODIFIED',
      resource: 'CONSENT_SETTINGS',
      resourceId: record.id,
      details: `Consent for ${parsed.data.consentType} set to ${parsed.data.granted ? 'GRANTED' : 'REVOKED'} by user`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json(record);
  },
};
