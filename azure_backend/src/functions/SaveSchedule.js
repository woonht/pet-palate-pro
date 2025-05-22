const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('SaveSchedule', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('SaveSchedule triggered');

    try {
      const schedule = await request.json();

      if (!schedule || !schedule.formType){
        return{
          status:400,
          headers: { "Content-Type": "application/json" },
          body:JSON.stringify({error: 'Missing formType in request body.'})
        };
      }

      if (schedule.formType !== "schedule"){
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({error: "Invalid formType. Only 'schedule' is allowed."})
        } 
      }

      const itemToSave = {
        ...schedule,
        timestamp: new Date().toISOString()
      };

      const container = client.database(dbName).container("AutomatedSchedule");
      
      itemToSave.id = `${schedule.userID}_${schedule.timeID}`;
      itemToSave.ScheduleID = itemToSave.id

      const { resource } = await container.items.create(itemToSave);

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resource),
      };
    } 
    catch (error) {
      context.log.error('Error saving schedule to Cosmos DB:', error);
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to save data."}),
      };
    }
  }
});
