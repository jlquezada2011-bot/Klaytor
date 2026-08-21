import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { messageCreateSchema } from '../validators/index.js';
import type { Message, Notification } from '../../types/index.js';

export const messageController = {
  async getMessages(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const partnerId = req.query.partnerId as string;
    const currentUserId = req.user.id;

    let messages = Array.from(db.messages.values()).filter(
      (m) => m.senderId === currentUserId || m.receiverId === currentUserId
    );

    if (partnerId) {
      messages = messages.filter(
        (m) =>
          (m.senderId === currentUserId && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === currentUserId)
      );
    }

    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark received messages as read
    messages.forEach((m) => {
      if (m.receiverId === currentUserId) {
        m.isRead = true;
      }
    });

    res.json(messages);
  },

  async sendMessage(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parsed = messageCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const receiverUser = db.users.get(parsed.data.receiverId);
    if (!receiverUser) {
      res.status(404).json({ error: 'Recipient user was not found.' });
      return;
    }

    let senderName = req.user.email;
    if (req.user.role === 'PATIENT') {
      const p = db.findPatientByUserId(req.user.id);
      if (p) senderName = `${p.firstName} ${p.lastName}`;
    } else if (req.user.role === 'PROVIDER') {
      const p = db.findProviderByUserId(req.user.id);
      if (p) senderName = `Dr. ${p.firstName} ${p.lastName}`;
    }

    let receiverName = receiverUser.email;
    if (receiverUser.role === 'PATIENT') {
      const p = db.findPatientByUserId(receiverUser.id);
      if (p) receiverName = `${p.firstName} ${p.lastName}`;
    } else if (receiverUser.role === 'PROVIDER') {
      const p = db.findProviderByUserId(receiverUser.id);
      if (p) receiverName = `Dr. ${p.firstName} ${p.lastName}`;
    }

    const now = new Date().toISOString();
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: req.user.id,
      senderName,
      senderRole: req.user.role,
      receiverId: receiverUser.id,
      receiverName,
      appointmentId: parsed.data.appointmentId,
      content: parsed.data.content,
      isRead: false,
      createdAt: now,
    };

    db.messages.set(newMessage.id, newMessage);

    // Notify receiver
    const notif: Notification = {
      id: `notif_${Date.now()}`,
      userId: receiverUser.id,
      title: `New message from ${senderName}`,
      message: parsed.data.content.length > 60 ? `${parsed.data.content.substring(0, 60)}...` : parsed.data.content,
      type: 'message',
      isRead: false,
      relatedId: newMessage.id,
      createdAt: now,
    };
    db.notifications.set(notif.id, notif);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'MESSAGE_SENT',
      resource: 'MESSAGES',
      resourceId: newMessage.id,
      details: `Secure message sent from ${req.user.email} to ${receiverUser.email}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newMessage);
  },
};
