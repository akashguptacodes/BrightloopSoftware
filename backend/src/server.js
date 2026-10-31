require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');
require('./config/redis');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(` Subscription Management Backend is Running!   `);
    console.log(` Port: ${PORT}                                  `);
    console.log(` Environment: ${process.env.NODE_ENV || 'dev'} `);
    console.log(`===============================================`);
});

