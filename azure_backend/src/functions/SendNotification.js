const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('SendNotification', {
    methods: ['POST'],
    authLevel: 'anonymous', // or 'function' depending on your security needs
    handler: async (request, context) => {
        context.log('Telemetry received:', request.body);

        const { device_id, title , body } = await request.json();

        if (!device_id) {
            return {
                status: 400,
                body: { error: 'Missing device_id in request body' }
            };
        }

        try {
            const database = client.database(dbName);
            const container = database.container('PushToken');

            const querySpec = {
                query: 'SELECT * FROM c WHERE c.device_id = @device_id',
                parameters: [{ name: '@device_id', value: device_id }],
            };

            const { resources: results } = await container.items.query(querySpec).fetchAll();

            if (results.length === 0) {
                context.log.warn(`No push token found for device_id: ${device_id}`);
                return {
                    status: 404,
                    body: { error: `No push token found for device_id: ${device_id}` }
                };
            }

            for (const doc of results) {
                const pushToken = doc.expoPushToken;
                if (!pushToken) {
                    context.log.warn(`No expoPushToken in user document: ${doc.id}`);
                    continue;
                }

                const notification = {
                    to: pushToken,
                    sound: 'default',
                    title: title,
                    body: body,
                };

                const response = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Accept-Encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(notification),
                });

                const result = await response.json();
                context.log('Notification result:', result);
            }

            return {
                status: 200,
                body: { message: 'Notifications sent successfully' }
            };
        } 
        catch (err) {
            context.log.error('Error sending notification:', err.message || err);
            return {
                status: 500,
                body: { error: err.message || 'Failed to send notification' }
            };
        }
    }
});
