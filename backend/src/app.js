const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Subscription Management System API',
        timestamp: new Date().toISOString(),
    });
});

// Placeholder route groupings (to be connected with controllers)
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
        },
    });
});

module.exports = app;

