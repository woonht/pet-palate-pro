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
      const bodyText = await request.text();

      if (!bodyText) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Empty request body" }),
        };
      }

      let schedules;
      try {
        schedules = JSON.parse(bodyText);
      } 
      catch (parseError) {
        context.log.error("Failed to parse JSON body:", parseError);
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid JSON format" }),
        };
      }

      if (!Array.isArray(schedules)) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Expected an array of schedules" }),
        };
      }

      const container = client.database(dbName).container("AutomatedSchedule");
      const savedItems = [];

      for (const schedule of schedules) {
        if (!schedule.formType || schedule.formType !== "schedule") {
          context.log.warn("Skipping invalid item (missing or incorrect formType):", schedule);
          continue;
        }

        const itemToSave = {
          ...schedule,
          timestamp: new Date().toISOString(),
          id: `${schedule.userID}_${schedule.timeID}`,
          ScheduleID: `${schedule.userID}_${schedule.timeID}`
        };

        const { resource } = await container.items.upsert(itemToSave);
        savedItems.push(resource);
      }

      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Schedules saved successfully", savedCount: savedItems.length }),
      };
    } catch (error) {
      context.log.error('Error saving schedules to Cosmos DB:', error);
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to save schedules." }),
      };
    }
  }
});
