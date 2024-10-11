const Client = require('.').default

const client = new Client({
    type: 'udp4',
    host: '127.0.0.1',
    port: 5100,
    password: '123',
    intervals: {
        ReconnectInterval: 5000
    }
})

client.setEnabled(true)

client.on('connected', () => console.log('connected'))
client.on('disconnected', () => console.log('disconnected'))
client.on('error', (err) => console.error(err))

