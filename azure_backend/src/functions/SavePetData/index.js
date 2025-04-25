const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key }); //used to interact with the database (read/write operations)

app.http('SavePetData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const data = await request.json();

        if (!data || !data.formType) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Missing formType in request body." }),
            };
        }

        const containerName = {
            basic_info: "BasicInfo",
            personality_habit: "PersonalityHabit",
            medical_record: "MedicalRecord",
            prescription: "Prescription"
        }[data.formType];

        if (!containerName) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Invalid formType value." }),
            };
        }

        const database = client.database(dbName);
        const container = database.container(containerName);

        const itemToSave = { ...data };

        try {
            let resource;
            if (itemToSave.id) {
                // If ID exists, try to upsert (update or insert) the document
                const { resource: updatedResource } = await container.items.upsert(itemToSave);
                resource = updatedResource;
            } else {
                // If no ID, create a new document
                const { resource: createdResource } = await container.items.create(itemToSave);
                resource = createdResource;
            }
            
            return {
                status: 200,
                body: JSON.stringify(resource),
            };
        } catch (error) {
            context.log.error("Error saving to Cosmos DB:", error);
            return {
                status: 500,
                body: JSON.stringify({ error: "Failed to save data." }),
            };
        }
    }
});