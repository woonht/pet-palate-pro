const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_URI;
const key = process.env.COSMOS_KEY;
const dbname = process.env.COSMOS_DB_NAME;
const client = new CosmosClient({ endpoint, key });

app.http('GetDeviceRegistration', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('GetDeviceRegistration triggered');

        try{
            const device_id = request.query.get('device_id');

            if (!device_id){
                return{
                    status:400,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ error: 'Missing device_id in query parameter' })
                };
            }

            const database = client.database(dbname);
            const container = database.container('DeviceRegistration');

            const { resource: device } = await container.item(device_id, device_id).read();

            if(!device){
                return{
                    status:404,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({error: 'Invalid device id.'})
                };
            }

            if(device.status === 'active' || device.status === 'broken'){
                return{
                    status: 400,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({error: 'Please enter an available pet feeder device id.'})
                };
            }
            else{
                return{
                    status:200,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify('Device is available and exist.')
                };
            }
        }
        catch (e){
            context.error('Failed to load device registration data: ', e)
            return{
                status: 400,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify('Failed to load device registration data.')
            };
        }

    }
});
