import db from '../db.js';
import admin from '../config/firebase.js';

export const putFCMToken = async (req, res) => {
    const { fcm_token, user_id } = req.body;

    if (!fcm_token || !user_id) {
        return res.status(400).json({ message: 'fcm_token and user_id are required.' });
    }

    try {
        await db.query(
            'INSERT INTO FCM_Token (fcm_token, user_id) VALUES ($1, $2) ON DUPLICATE KEY UPDATE user_id = $3',
            [fcm_token, user_id, user_id]
        );
        res.status(200).json({ message: 'FCM token saved successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save FCM token.' });
    }
};

export const sendNotification = async (req, res) => {
    const { title, description, user_id } = req.body;

    if (!title || !description || !user_id) {
        return res.status(400).json({ message: 'title, description, and user_id are required.' });
    }

    try {
        const [rows] = await db.query('SELECT fcm_token FROM FCM_Token WHERE user_id = $1', [user_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No FCM tokens found for the user.' });
        }

        const tokens = rows.map(row => row.fcm_token);

        const payload = {
            notification: {
                title,
                body: description,
            },
        };

        const response = await admin.messaging().sendToDevice(tokens, payload);

        res.status(200).json({ message: 'Notification sent successfully.', response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send notification.' });
    }
};