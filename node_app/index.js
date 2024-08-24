const axios = require('axios');
const mqtt = require('mqtt');
const { Client } = require('pg');

// Function to fetch the access token
async function fetchAccessToken() {
    try {
        const loginCredentials = {
            login: 'backend',  // Replace with actual username
            password: 'backend',  // Replace with actual password
        };

        const response = await axios.post('http://dh_auth:8090/auth/rest/token', loginCredentials, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'http://localhost',
                // Include other headers if needed
            }
        });

        if (response.status !== 201) {
            throw new Error('Failed to fetch access token');
        }

        return response.data.accessToken;
    } catch (error) {
        console.error('Error fetching access token:', error.message);
        throw error;
    }
}

// Function to fetch devices from the API
async function getDevices(token) {
    try {
        const response = await axios.get('http://dh_frontend:8080/api/rest/device', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error.message);
        throw error;
    }
}

// Function to refresh device list
let devices = [];  // Biến toàn cục để lưu danh sách thiết bị

async function refreshDeviceList() {
    try {
        const token = await fetchAccessToken();
        if (token) {
            const listDevices = await getDevices(token);
            if (listDevices && listDevices.length > 0) {
                devices = listDevices;  // Cập nhật biến toàn cục
            } else {
                console.log('No devices found.');
            }
        }
    } catch (error) {
        console.error('Error refreshing device list:', error.message);
    }
}

// Thiết lập để làm mới danh sách thiết bị mỗi 5 giây
setInterval(refreshDeviceList, 5000);

// MQTT and PostgreSQL setup
const mqttBrokerUrl = 'mqtt://mqtt_broker1';
const topic = 'sensor/data';

const client = new Client({
    user: "login",
    host: 'postgres',  // Tên service PostgreSQL trong Docker Compose
    database: "devicehivedb",
    password: "pass",
    port: 5432,  // Port PostgreSQL mặc định
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');
        createTable();})
    .catch(err => console.error('Connection error', err.stack));

const createTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sensor_data (
            id SERIAL PRIMARY KEY,
            temperature FLOAT NOT NULL,
            humidity FLOAT NOT NULL,
            timestamp TIMESTAMPTZ NOT NULL,
            device_name TEXT NOT NULL
        );
    `;

    await client.query(createTableQuery);
};



const mqttClient = mqtt.connect(mqttBrokerUrl);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    try {
        // Phân tích dữ liệu tin nhắn
        const payload = JSON.parse(message.toString());
        const { temperature, humidity, device_id } = payload;
        
        // Kiểm tra nếu devices là một mảng
        if (!Array.isArray(devices)) {
            console.error('Devices is not an array');
            return;
        }

        // Tìm thiết bị trong danh sách
        const device = devices.find(dev => dev.id === device_id); // Sửa thuộc tính để so sánh chính xác
        console.log('Device Found:', device);

        // Trả về id của device nếu tìm thấy, hoặc null nếu không tìm thấy
        const deviceName = device ? device.name : null;
        console.log('Device name:', deviceName);

        if (deviceName) {
            // Chèn dữ liệu vào cơ sở dữ liệu PostgreSQL
            const query = 'INSERT INTO sensor_data (temperature, humidity, timestamp, device_name) VALUES ($1, $2, NOW(), $3)';
            await client.query(query, [temperature, humidity, deviceName]);
            console.log('Data inserted into PostgreSQL');
        } else {
            console.log('Sensor not found!');
        }
    } catch (err) {
        console.error('Error inserting data:', err.stack);
    }
});
