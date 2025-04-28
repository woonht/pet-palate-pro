// DeletePrescription.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('DeletePrescription', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('DeletePrescription triggered');

    const petId = request.query.get("petId");

    if (!petId || !prescriptionId) {
      return {
        status: 400,
        body: JSON.stringify({ 
          error: "Both petId and prescriptionId are required in query parameters." 
        }),
      };
    }

    const container = client.database(dbName).container("Prescription");

    try {
      const { statusCode } = await container.item(prescriptionId, petId).delete();
      
      if (statusCode === 204) {
        return {
          status: 200,
          body: JSON.stringify({ 
            message: "Prescription deleted successfully" 
          })
        };
      }

      return {
        status: 404,
        body: JSON.stringify({ 
          error: "Prescription not found" 
        })
      };

    } catch (error) {
      context.log.error('Error deleting prescription:', error);
      return {
        status: 500,
        body: JSON.stringify({ 
          error: error.message || "Failed to delete prescription" 
        })
      };
    }
  }
});