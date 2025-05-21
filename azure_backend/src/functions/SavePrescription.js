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
      const requiredFields = ['vaccine', 'vet', 'date'];
      const missingFields = requiredFields.filter(field => !prescriptionData[field]);

      if (!prescriptionData || !prescriptionData.formType){
        return{
          status:400,
          headers: { "Content-Type": "application/json" },
          body:JSON.stringify({error: 'Missing formType in request body.'})
        };
      }

      if (missingFields.length > 0) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        };
      }

      if (prescriptionData.formType !== "prescription"){
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({error: "Invalid formType. Only 'prescription' is allowed."})
        } 
      }

      const itemToSave = {
        ...prescriptionData,
        timestamp: new Date().toISOString()
      };

      const container = client.database(dbName).container("Prescription");
      
      itemToSave.id = `${prescriptionData.userID}_${prescriptionData.timeID}`;
      itemToSave.presID = itemToSave.id

      const { resource } = await container.items.create(itemToSave);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to save data."}),
      };
    }
  }
});
