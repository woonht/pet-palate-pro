const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const cosmosClient = new CosmosClient(process.env.CosmosDBConnectionString);
const database = cosmosClient.database('PetCareDB');
const container = database.container('Prescriptions');

app.http('SavePrescription', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Saving prescription...`);

        try {
            const prescription = await request.json();
            
            // Add timestamp if not provided
            if (!prescription.id) {
                prescription.id = Date.now().toString();
            }

            const { resource: createdItem } = await container.items.create(prescription);

            return {
                status: 200,
                jsonBody: createdItem
            };
        } catch (error) {
            context.log(`Error: ${error}`);
            return {
                status: 500,
                jsonBody: { error: 'Failed to save prescription' }
            };
        }
    }
});