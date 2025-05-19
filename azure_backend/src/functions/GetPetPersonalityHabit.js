const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('GetPetPersonalityHabit', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('GetPetPersonalityHabit triggered');

        const formType = request.query.get("formType");
        const userID = request.query.get("userID");

        if (!formType || !userID) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Missing formType or userID in query parameters." }),
            };
        }
        
        let containerName;
        if (formType == "personality_habit") {
            containerName = "PersonalityHabits";
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
                query: "SELECT * FROM c WHERE c.userID = @userID",
                parameters: [{ name: "@userID", value: userID }]
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
