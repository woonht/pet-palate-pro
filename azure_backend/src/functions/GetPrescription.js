// GetPetPrescription.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('GetPetPrescription', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('GetPetPrescription triggered');

    const petId = request.query.get("petId");
    const prescriptionId = request.query.get("prescriptionId");

    if (!petId) {
      return {
        status: 400,
        body: JSON.stringify({ error: "Missing petId in query parameters." }),
      };
    }

    const container = client.database(dbName).container("Prescription");

    try {
      let query;
      if (prescriptionId) {
        query = {
          query: "SELECT * FROM c WHERE c.petId = @petId AND c.id = @prescriptionId",
          parameters: [
            { name: "@petId", value: petId },
            { name: "@prescriptionId", value: prescriptionId }
          ]
        };
      } else {
        query = {
          query: "SELECT * FROM c WHERE c.petId = @petId ORDER BY c.date DESC",
          parameters: [{ name: "@petId", value: petId }]
        };
      }

      const { resources } = await container.items.query(query).fetchAll();

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescriptionId ? resources[0] || {} : resources),
      };
    } catch (error) {
      context.log.error('Error retrieving prescriptions:', error.message);
      return {
        status: 500,
        body: JSON.stringify({ error: error.message || "Failed to fetch prescriptions" }),
      };
    }
  }
});
