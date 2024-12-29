import db from '../db.js';
import admin from '../config/firebase.cjs';

export const putFCMToken = async (req, res) => {
    const { fcm_token, user_id } = req.body;

    if (!fcm_token || !user_id) {
        return res.status(400).json({ message: 'fcm_token and user_id are required.' });
    }

    try {
        await db.query(
            `INSERT INTO FCM_Token (fcm_token, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (fcm_token) 
             DO UPDATE SET user_id = EXCLUDED.user_id`,
            [fcm_token, user_id]
        );
        res.status(200).json({ message: 'FCM token saved successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Failed to save FCM token. ${err}` });
    }
};

export const sendNotification = async (req, res) => {
    const { title, description, user_id } = req.body;

    if (!title || !description || !user_id) {
        return res.status(400).json({ message: 'title, description, and user_id are required.' });
    }

    try {
        const { rows } = await db.query('SELECT fcm_token FROM FCM_Token WHERE user_id = $1', [user_id]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No FCM tokens found for the user.' });
        }

        const tokens = rows.map(row => row.fcm_token);
        if (tokens.length === 0) {
            return res.status(404).json({ message: 'No valid FCM tokens available for the user.' });
        }

        const payload = {
            notification: {
                title,
                body: description,
            },
        };

        const response = await admin.messaging().sendToDevice(tokens, payload);

        // Handle invalid tokens from FCM response
        const invalidTokens = [];
        response.results.forEach((result, index) => {
            if (result.error && result.error.code === 'messaging/invalid-registration-token') {
                invalidTokens.push(tokens[index]);
            }
        });

        if (invalidTokens.length > 0) {
            await db.query('DELETE FROM FCM_Token WHERE fcm_token = ANY($1)', [invalidTokens]);
        }

        res.status(200).json({
            message: 'Notification sent successfully.',
            successCount: response.successCount,
            failureCount: response.failureCount,
            invalidTokens,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Failed to send notification. ${err.message}` });
    }
};