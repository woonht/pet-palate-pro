// SavePetPrescription.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('SavePetPrescription', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('SavePetPrescription triggered');

    try {
      const prescriptionData = await request.json();

      // Validate required fields
      const requiredFields = ['petId', 'vaccine', 'vet', 'date'];
      const missingFields = requiredFields.filter(field => !prescriptionData[field]);

      if (!prescriptionData || !prescriptionData.formType){
        return{
          status:400,
          body:JSON.stringify({error: 'Missing formType in request body.'})
        };
      }

      if (missingFields.length > 0) {
        return {
          status: 400,
          body: JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        };
      }

      if (prescriptionData.formType !== "prescription"){
        return {
          status: 400,
          body: JSON.stringify({error: "Invalid formType. Only 'prescription' is allowed."})
        } 
      }

      const itemToSave = {
        ...prescriptionData,
        timestamp: new Date().toISOString()
      };

      const container = client.database(dbName).container("Prescription");
      
      let resource;
      if(itemToSave.id){
        const { resource: updatedResource } = await container.items.upsert(itemToSave);
        resource = updatedResource;
      }
      else{
        const { resource: createdResource} = await container.items.create(itemToSave);
        resource = createdResource;
      }

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      };
    } 
    catch (error) {
      context.log.error('Error saving prescription to Cosmos DB:', error);
      return {
        status: 500,
        body: JSON.stringify({ error: "Failed to save data."}),
      };
    }
  }
});
