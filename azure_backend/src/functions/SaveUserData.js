const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbName = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key })

app.http('SaveUserData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('SaveUserData triggered.');
        
        try{
            const user_data = await request.json();

            if(!user_data || !user_data.formType){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({error: "Missing formType in request body"}),
                };
            }

            if(user_data.formType !== "user_data"){
                return{
                    status:400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({error: "Invalid formType. Only 'user_data' is allowed."})
                };
            }

            const database = client.database(dbName);
            const container = database.container("UserData");

            const { resources: allUsers } = await container.items.query("SELECT VALUE COUNT(1) FROM c").fetchAll(); // COUNT(1) OR COUNT(*) both count total document
            const number = allUsers[0] + 1;
            
            const itemToSave = {
                ...user_data,
                timeStamp: new Date().toISOString(),
                device_id: `pet_feeder_${number}`
            };

            itemToSave.id = user_data.userID;

            // Query to check for existing username or email
            const querySpecUsername = {
                query: "SELECT * FROM c WHERE c.name = @name",
                parameters: [{ name: "@name", value: itemToSave.name }]
            };

            const querySpecEmail = {
                query: "SELECT * FROM c WHERE c.email = @email",
                parameters: [{ name: "@email", value: itemToSave.email }]
            };

            const { resources: existingUsernames } = await container.items.query(querySpecUsername).fetchAll();
            const { resources: existingEmails } = await container.items.query(querySpecEmail).fetchAll();

            // If duplicates exist and this is a new registration (no id), reject with 409
            // If the query found any matching document
            // And if the incoming data does not have an id field (which means it’s a new registration, not an update)
            if (existingUsernames.length > 0 && existingEmails.length > 0){
                return {
                    status: 409,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Username and email already exists." })
                };   
            }
            if (existingUsernames.length > 0) {
                return {
                    status: 409,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Username already exists." })
                };
            }
            if (existingEmails.length > 0) {
                return {
                    status: 409,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Email already exists." })
                };
            }

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
            context.log.error("Error saving user data to Cosmos DB: ", error)
            return{
                status: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({error: "Failed to save data."})
            };
        }
    }
});
