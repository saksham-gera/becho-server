import db from '../db.js';
import admin from '../config/firebase.cjs';

export const putFCMToken = async (req, res) => {
    const { fcm_token, user_id } = req.body;

    if (!fcm_token || !user_id) {
        return res.status(400).json({ message: 'fcm_token and user_id are required.' });
    }

    try {
        await db.query(
            `INSERT INTO fcm_tokens (fcm_token, user_id) 
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

    if (!title || !description) {
        return res.status(400).json({ message: 'title and description are required.' });
    }

    try {
        let query;
        let queryParams;

        if (user_id) {
            query = 'SELECT fcm_token FROM fcm_tokens WHERE user_id = $1';
            queryParams = [user_id];
        } else {
            query = 'SELECT fcm_token FROM fcm_tokens';
            queryParams = [];
        }

        const { rows } = await db.query(query, queryParams);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No FCM tokens found.' });
        }

        const tokens = rows.map(row => row.fcm_token);

        // Create an array to store the send promises
        const sendPromises = tokens.map(token => {
            const message = {
                token: token,
                notification: {
                    title: title,
                    body: description,
                },
            };

            return admin.messaging().send(message);
        });

        // Wait for all the send requests to complete
        const responses = await Promise.all(sendPromises);

        // Find invalid tokens
        const invalidTokens = [];
        responses.forEach((result, index) => {
            if (result.error && result.error.code === 'messaging/invalid-registration-token') {
                invalidTokens.push(tokens[index]);
            }
        });

        if (invalidTokens.length > 0) {
            await db.query('DELETE FROM fcm_tokens WHERE fcm_token = ANY($1)', [invalidTokens]);
        }

        res.status(200).json({
            message: 'Notification sent successfully.',
            successCount: responses.filter(res => !res.error).length,
            failureCount: responses.filter(res => res.error).length,
            invalidTokens,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Failed to send notification. ${err.message}` });
    }
};