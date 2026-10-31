import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Razorpay webhook receiver
router.post('/razorpay', handleRazorpayWebhook);

export default router;

