import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const notificationController = {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const notifs = Array.from(db.notifications.values())
      .filter((n) => n.userId === req.user?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    res.json({
      notifications: notifs,
      unreadCount,
    });
  },

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const notif = db.notifications.get(id);

    if (!notif || notif.userId !== req.user.id) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }

    notif.isRead = true;
    res.json(notif);
  },

  async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    for (const notif of db.notifications.values()) {
      if (notif.userId === req.user.id) {
        notif.isRead = true;
      }
    }

    res.json({ message: 'All notifications marked as read.' });
  },
};
