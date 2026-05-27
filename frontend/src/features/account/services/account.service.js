import { USERS_MOCK } from '@/mock/users.mock';
import { NOTIFICATIONS_MOCK } from '@/mock/notifications.mock';
import { MESSAGES_MOCK } from '@/mock/messages.mock';
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));
export const accountService = {
    updateProfile: async (userId, data) => {
        await delay();
        const user = USERS_MOCK.find(u => u.id === userId);
        if (user)
            Object.assign(user, data);
        return user;
    },
    getNotifications: async (userId) => {
        await delay();
        return NOTIFICATIONS_MOCK.filter(n => n.userId === userId);
    },
    markNotificationRead: async (id) => {
        await delay();
        const notif = NOTIFICATIONS_MOCK.find(n => n.id === id);
        if (notif)
            notif.read = true;
    },
    getConversations: async (userId) => {
        await delay();
        return MESSAGES_MOCK.filter(c => c.participants.includes(userId));
    },
    sendMessage: async (conversationId, senderId, text) => {
        await delay();
        const conv = MESSAGES_MOCK.find(c => c.id === conversationId);
        if (!conv)
            return;
        const newMsg = {
            id: conv.messages.length + 1,
            senderId,
            text,
            createdAt: new Date().toISOString(),
        };
        conv.messages.push(newMsg);
        conv.lastMessageAt = newMsg.createdAt;
        return newMsg;
    },
};
