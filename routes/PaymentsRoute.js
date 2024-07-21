const express = require('express');
const router = express.Router();
const Payments = require('../models/Connectorpayments.js');

router.get('/payments/:id', async (req, res) => {
    const { id } = req?.params;
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 5;
    try {
        const payments = await Payments.find({ connector_id: id })
            .sort({ _id: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const count = await Payments.countDocuments({ connector_id: id });
        res.status(200).json({
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/payments', async (req, res) => {
    const { paymentDate, paymentAmount, paymentTime, applicationNumber, connector_id } = req.body;

    const payment = new Payments({
        paymentDate,
        paymentAmount,
        paymentTime,
        applicationNumber,
        connector_id,
    });

    try {
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;