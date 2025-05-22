// DeletePrescription.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('DeleteSchedule', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('DeleteSchedule triggered');

    const userID = request.query.get("userID");
    const timeID = request.query.get("timeID");

    if (!userID || !timeID) {
      return {
        status: 400,
        body: JSON.stringify({ 
          error: "userID and timeID are required in query parameters." 
        }),
      };
    }

    const container = client.database(dbName).container("AutomatedSchedule");
    const id = `${userID}_${timeID}`;

    try {
      try{
        await container.item(id, id).delete();
        return {
          status: 200,
          body: JSON.stringify({ 
            message: "Prescription deleted successfully" 
          })
        };        
      }
      catch(error){
        return {
          status: 404,
          body: JSON.stringify({ 
            error: error.message ||"Prescription not found" 
          })
        };
      }
    } 
    catch (error) {
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