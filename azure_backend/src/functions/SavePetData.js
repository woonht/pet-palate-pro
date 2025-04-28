const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key }); //used to interact with the database (read/write operations), endpoint specific where is the db, key means i am allowed to access

app.http('SavePetData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('SavePetData triggered');

        const data = await request.json();

        if (!data || !data.formType) {
            return {
                status: 400,
                body: JSON.stringify({ error: "Missing formType in request body." }),
            };
        }

        if (data.formType !== "basic_info") {
            return {
                status: 400,
                body: JSON.stringify({ error: "Invalid formType. Only 'basic_info' is allowed." }),
            };
        }

        const database = client.database(dbName);
        const container = database.container("BasicInfo");

        const itemToSave = { 
            ...data,
            timestamp: new Date().toISOString() 
        };

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