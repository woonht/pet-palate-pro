const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const cosmosClient = new CosmosClient(process.env.CosmosDBConnectionString);
const database = cosmosClient.database('PetCareDB');
const container = database.container('Prescriptions');

app.http('GetPrescription', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Fetching prescriptions...`);

        try {
            const { resources: prescriptions } = await container.items
                .query("SELECT * FROM c")
                .fetchAll();

            return {
                status: 200,
                jsonBody: prescriptions
            };
        } catch (error) {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                jsonBody: { error: 'Failed to fetch prescriptions' }
            };
        }
    }
});