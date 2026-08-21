import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/store.js';
import type { UserRole, User, PatientProfile, ProviderProfile } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'klaytor-super-secure-production-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
  patientProfile?: PatientProfile;
  providerProfile?: ProviderProfile;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = db.users.get(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User account is inactive or no longer exists.' });
      return;
    }

    req.user = db.sanitizeUser(user);

    if (user.role === 'PATIENT') {
      req.patientProfile = db.findPatientByUserId(user.id);
    } else if (user.role === 'PROVIDER') {
      req.providerProfile = db.findProviderByUserId(user.id);
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.addAuditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'UNAUTHORIZED_ROLE_ACCESS',
        resource: req.originalUrl,
        details: `User with role ${req.user.role} attempted to access restricted endpoint requiring [${allowedRoles.join(', ')}]`,
        ipAddress: req.ip || 'unknown',
        status: 'BLOCKED',
      });

      res.status(403).json({
        error: `Access forbidden. This resource requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export function requirePatientOrProviderAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const targetPatientId = req.params.patientId || req.query.patientId as string || req.body?.patientId as string;

  // Providers can access patient records
  if (req.user.role === 'PROVIDER') {
    next();
    return;
  }

  // Patients can ONLY access their own patient ID
  if (req.user.role === 'PATIENT') {
    if (!req.patientProfile) {
      res.status(403).json({ error: 'Patient profile not found.' });
      return;
    }

    if (targetPatientId && targetPatientId !== req.patientProfile.id) {
      db.addAuditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CROSS_PATIENT_ACCESS_BLOCKED',
        resource: req.originalUrl,
        resourceId: targetPatientId,
        details: `Patient ${req.patientProfile.id} attempted to access private records of patient ${targetPatientId}`,
        ipAddress: req.ip || 'unknown',
        status: 'BLOCKED',
      });

      res.status(403).json({
        error: 'Forbidden. You do not have permission to access another patient\'s private medical information.',
      });
      return;
    }

    next();
    return;
  }

  // Admins manage administrative settings, not private clinical charts without provider credentials
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  res.status(403).json({ error: 'Access forbidden.' });
}
