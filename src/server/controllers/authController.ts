import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/store.js';
import { generateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/index.js';
import type { UserWithPassword } from '../db/store.js';
import type { PatientProfile, ProviderProfile } from '../../types/index.js';

export const authController = {
  async register(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
        return;
      }

      const {
        email,
        password,
        role,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bloodType,
        phone,
        address,
        emergencyContactName,
        emergencyContactPhone,
        title,
        specialty,
        licenseNumber,
        clinicId,
      } = parsed.data;

      // Check if user already exists
      if (db.findUserByEmail(email)) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }

      const now = new Date().toISOString();
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newUser: UserWithPassword = {
        id: userId,
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      db.users.set(newUser.id, newUser);

      let profile: PatientProfile | ProviderProfile | null = null;

      if (role === 'PATIENT') {
        const patientProfile: PatientProfile = {
          id: `pat_${Date.now()}`,
          userId: newUser.id,
          firstName,
          lastName,
          dateOfBirth: dateOfBirth || '1990-01-01',
          gender: gender || 'Unspecified',
          bloodType: bloodType || 'Unknown',
          phone: phone || '',
          address: address || '',
          emergencyContactName: emergencyContactName || '',
          emergencyContactPhone: emergencyContactPhone || '',
          createdAt: now,
          updatedAt: now,
        };
        db.patientProfiles.set(patientProfile.id, patientProfile);
        profile = patientProfile;

        // Default consent records
        const consentTypes = [
          { type: 'DATA_PROCESSING', desc: 'Consent for electronic processing of personal health data.' },
          { type: 'TELEHEALTH_COMMUNICATION', desc: 'Consent for secure messaging and remote consultation.' },
          { type: 'LAB_DATA_SHARING', desc: 'Authorization for laboratory results delivery.' },
          { type: 'AUDIT_LOG_TRACKING', desc: 'Agreement for security access and audit logging.' },
        ];
        consentTypes.forEach((c) => {
          db.consentRecords.set(`${newUser.id}_${c.type}`, {
            id: `con_${Date.now()}_${c.type}`,
            userId: newUser.id,
            consentType: c.type,
            description: c.desc,
            granted: true,
            termsVersion: 'v1.4',
            updatedAt: now,
          });
        });
      } else if (role === 'PROVIDER') {
        const defaultClinic = db.clinics.values().next().value;
        const providerProfile: ProviderProfile = {
          id: `prov_${Date.now()}`,
          userId: newUser.id,
          firstName,
          lastName,
          title: title || 'MD',
          specialty: specialty || 'General Practice',
          licenseNumber: licenseNumber || `MD-${Math.floor(10000 + Math.random() * 90000)}`,
          clinicId: clinicId || defaultClinic?.id || 'clinic_1',
          clinicName: defaultClinic?.name || 'Klaytor St. Jude Medical Center',
          bio: 'Healthcare provider dedicated to patient-centered clinical care.',
          phone: phone || '+1 (555) 000-0000',
          createdAt: now,
          updatedAt: now,
        };
        db.providerProfiles.set(providerProfile.id, providerProfile);
        profile = providerProfile;
      }

      const safeUser = db.sanitizeUser(newUser);
      const token = generateToken(safeUser);

      // Log successful registration
      db.addAuditLog({
        userId: safeUser.id,
        userEmail: safeUser.email,
        action: 'USER_REGISTRATION',
        resource: 'AUTH',
        details: `New ${role.toLowerCase()} account registered: ${safeUser.email}`,
        ipAddress: req.ip || 'unknown',
        status: 'SUCCESS',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: safeUser,
        profile,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed.' });
    }
  },

  async login(req: AuthenticatedRequest, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
        return;
      }

      const { email, password } = parsed.data;
      const user = db.findUserByEmail(email);

      if (!user) {
        db.addAuditLog({
          userEmail: email,
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          details: 'Failed login attempt: user not found',
          ipAddress: req.ip || 'unknown',
          status: 'FAILURE',
        });
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        db.addAuditLog({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          details: 'Failed login attempt: incorrect password',
          ipAddress: req.ip || 'unknown',
          status: 'FAILURE',
        });
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
        return;
      }

      const safeUser = db.sanitizeUser(user);
      const token = generateToken(safeUser);

      let profile: PatientProfile | ProviderProfile | null = null;
      if (user.role === 'PATIENT') {
        profile = db.findPatientByUserId(user.id) || null;
      } else if (user.role === 'PROVIDER') {
        profile = db.findProviderByUserId(user.id) || null;
      }

      db.addAuditLog({
        userId: safeUser.id,
        userEmail: safeUser.email,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        details: `Successful login for ${safeUser.role}: ${safeUser.email}`,
        ipAddress: req.ip || 'unknown',
        status: 'SUCCESS',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: safeUser,
        profile,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed.' });
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let profile: PatientProfile | ProviderProfile | null = null;
    if (req.user.role === 'PATIENT') {
      profile = db.findPatientByUserId(req.user.id) || null;
    } else if (req.user.role === 'PROVIDER') {
      profile = db.findProviderByUserId(req.user.id) || null;
    }

    res.json({
      user: req.user,
      profile,
    });
  },

  async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user) {
      db.addAuditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'USER_LOGOUT',
        resource: 'AUTH',
        details: `User logged out: ${req.user.email}`,
        ipAddress: req.ip || 'unknown',
        status: 'SUCCESS',
      });
    }
    res.clearCookie('token');
    res.json({ message: 'Successfully logged out.' });
  },

  async forgotPassword(req: AuthenticatedRequest, res: Response) {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const user = db.findUserByEmail(parsed.data.email);
    if (user) {
      db.addAuditLog({
        userId: user.id,
        userEmail: user.email,
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'AUTH',
        details: `Password reset requested for ${user.email}`,
        ipAddress: req.ip || 'unknown',
        status: 'SUCCESS',
      });
    }

    // Always return success message to prevent user enumeration attacks
    res.json({
      message: 'If an account exists with this email, password reset instructions have been generated.',
      demoResetToken: 'DEMO-RESET-TOKEN-KLAYTOR-2026',
    });
  },

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const { email, newPassword } = parsed.data;
    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'PASSWORD_RESET_COMPLETED',
      resource: 'AUTH',
      details: `Password was successfully updated for ${user.email}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json({ message: 'Password has been successfully reset. You can now log in.' });
  },
};
