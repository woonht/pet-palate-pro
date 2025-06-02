const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbname = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('UpdateDeviceRegistration', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('UpdateDeviceRegistration triggered');

        try{
            const device_data = await request.json();
            
            if(!device_data || !device_data.device_id || !device_data.device_status){
                return {
                    status:400,
                    headers: {'Content-Type': 'application/json'},
                    body : JSON.stringify({error: "Missing device id and device status"})
                };
            }
            
            const device_id = device_data.device_id;
            const device_status = device_data.device_status;
            const database = client.database(dbname);
            const container = database.container("DeviceRegistration");

            const { resource: device } = await container.item(device_id, device_id).read();
            
            if(!device){
                return {
                    status:404,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({error: 'Device not found', device_id})
                }
            }

            device.status = device_status

            await container.item(device_id, device_id).replace(device);
            return{
                status:200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(device)
            }
        }
        catch (e){
            context.error('Updating error: ', e)
            return{
                status:400,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({error: 'Failed to update data.'})
            }
        }
    }
});
