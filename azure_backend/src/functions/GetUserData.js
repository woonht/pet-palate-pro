const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('GetUserData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('GetUserData triggered');

        const formType = request.query.get("formType");
        const username = request.query.get("name");

        if (!formType || !username) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Missing formType or username in query parameters." }),
            };
        }

        let containerName;
        if (formType == "user_data") {
            containerName = "UserData";
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
                query: "SELECT * FROM c WHERE c.name = @name",
                parameters: [{ name: "@name", value: username }]
            };

            const { resources } = await container.items.query(query).fetchAll();

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exists: resources.length > 0,
                    user: resources[0] || null
                }),
            };
        } catch (error) {
            context.log.error("Error querying Cosmos DB:", error);
            return {
                status: 500,
                body: JSON.stringify({ error: "Failed to check user existence." }),
            };
        }
    }
});
