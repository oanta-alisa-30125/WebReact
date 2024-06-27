const { v4: uuidv4 } = require('uuid');
const express = require("express");
const router = express.Router();
const stripe = require("stripe")("sk_test_51Kaz5vJCgqMIiSUC45tMgOsULtZTj46XjbB2cYwwzbjW91iUkJgig2OHPxNk4mm036tZkfRbcTeAVtpWnSmKtCfP00tvTihaM0")
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // Importă modelul Product

router.post('/placeorder', async (req, res) => {
    const { token, cartItems, currentUser, subtotal } = req.body;

    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const payment = await stripe.charges.create({
            amount: subtotal * 100,
            currency: 'ron',
            customer: customer.id,
            receipt_email: token.email
        }, {
            idempotencyKey: uuidv4()
        });

        if (payment) {
            const order = new Order({
                userid: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                orderItems: cartItems,
                shippingAddress: {
                    address: token.card.address_line1,
                    city: token.card.address_city,
                    country: token.card.address_country,
                    postalCode: token.card.address_zip
                },
                orderAmount: subtotal,
                transactionId: payment.id, 
                isDelivered: false
            });

            await order.save();

            // Actualizează stocul pentru fiecare produs
            for (let item of cartItems) {
                const product = await Product.findById(item._id);
                if (product) {
                    product.countInStock -= item.quantity;
                    await product.save();
                }
            }

            res.send('Order placed successfully');
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
    }
});

router.post('/getordersbyuserid', async (req, res) => {
    const { userid } = req.body;

    try {
        const orders = await Order.find({ userid });
        res.send(orders);
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
    }
});


router.post("/getorderbyid", async (req, res) => {
    const orderid = req.body.orderid;
    console.log("Request Order ID:", orderid);

    try {
        const order = await Order.findById(orderid);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.send(order);
    } catch (err) {
        res.status(400).json({ message: 'something went wrong' });
        console.log("Error:", err);
    }
});
router.get('/getallorders', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.send(orders);
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong', error: err.message });
    }
});

router.post('/deliverorder', async (req, res) => {
    const { orderid } = req.body;

    try {
        const order = await Order.findById(orderid);
        if (order) {
            order.isDelivered = true;
            await order.save();
            res.send('Order delivered successfully');
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Something went wrong', error });
    }
});

module.exports = router;
