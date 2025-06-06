const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('GetDeviceConfig', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('GetDeviceConfig triggered');

        const formType = request.query.get("formType");
        const userID = request.query.get("userID");
        const device_id = request.query.get("device_id");

        if (!formType || !userID || !device_id) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Missing formType, userID or device_id in query parameters." }),
            };
        }
        
        let containerName;
        if (formType == "device_config") {
            containerName = "DeviceConfig";
        }
        else{
            return {
                status: 400,
                body: JSON.stringify({ error: "Invalid formType value." }),
            };
        }

        const database = client.database(dbName);
        const container = database.container(containerName);

        try {
            const query = {
                query: "SELECT * FROM c WHERE c.userID = @userID AND c.device_id = @device_id",
                parameters: [{ name: "@userID", value: userID },
                             { name: "@device_id", value: device_id }]
            };

            const { resources } = await container.items.query(query).fetchAll();

            if (!resources.length) {
                return {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "No data found for this userID." }),
                };
            }

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resources[0]), // return the first match
            };
        } catch (error) {
            context.log.error("Error reading from Cosmos DB:", error);
            return {
                status: 500,
                body: JSON.stringify({ error: "Failed to fetch data." }),
            };
        }
    }
});
