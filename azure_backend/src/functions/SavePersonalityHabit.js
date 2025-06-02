const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key })

app.http('SavePersonalityHabit', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('SavePersonalityHabit triggered.');
        
        try{
            const personality_habit_data = await request.json();

            if(!personality_habit_data || !personality_habit_data.formType || !personality_habit_data.device_id){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({error: "Missing formType in request body"}),
                };
            }

            if(personality_habit_data.formType !== "personality_habit"){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({error: "Invalid formType. Only 'personality_habit' is allowed."})
                };
            }

            const database = client.database(dbName);
            const container = database.container("PersonalityHabits");

            const itemToSave = {
                ...personality_habit_data,
                timeStamp: new Date().toISOString,
                habitID: `${personality_habit_data.userID}_${personality_habit_data.device_id}`
            };

            itemToSave.id = `${personality_habit_data.userID}_${personality_habit_data.device_id}`;

            let resource;
            if(itemToSave.id){
                const { resource: updatedResource } = await container.items.upsert(itemToSave);
                resource = updatedResource;
            }
            else{
                const { resource: createdResource } = await container.items.create(itemToSave);
                resource = createdResource;
            }
            return{
                status:200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(resource)
            };
        }
        catch(error){
            context.log.error("Error saving personality and habit to Cosmos DB: ", error)
            return{
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({error: "Failed to save data."})
            };
        }
    }
});
