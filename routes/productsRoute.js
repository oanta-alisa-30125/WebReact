const express = require("express");
const router = express.Router();
const Product = require('../models/productModel');


router.get("/getallproducts", async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).send(products);
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});

router.post("/getproductbyid", async (req, res) => {
    try {
        const productId = req.body.productid;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        console.error("Error fetching product by ID:", err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.post('/addreview', async (req, res) => {
    const { review, productid, currentUser } = req.body;
    try {
        const product = await Product.findById(productid);
        const reviewmodel = {
            name: currentUser.name,
            userid: currentUser._id,
            rating: review.rating,
            comment: review.comment
        };
        product.reviews.push(reviewmodel);
        product.rating = product.reviews.reduce((acc, x) => acc + x.rating, 0) / product.reviews.length;
        await product.save();
        res.send('Review submitted successfully');
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong' });
    }
});

router.post('/deleteproduct', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.body.productid);
        res.send('Success');
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong: ' + err });
    }
});

router.post('/addproduct', async (req, res) => {
    try {
        const { product } = req.body;

        // Verificare și validare date de intrare
        if (!product || !product.name || !product.price || !product.description || !product.countInStock || !product.image || !product.category) {
            return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii și trebuie să fie completate.' });
        }

        // Crearea unui nou produs
        const productModel = new Product({
            name: product.name,
            price: product.price,
            description: product.description,
            countInStock: product.countInStock,
            image: product.image,
            category: product.category,
        });

        // Salvarea produsului în baza de date
        await productModel.save();

        // Răspuns de succes
        res.status(201).json({ message: 'Produsul a fost adăugat cu succes' });
    } catch (err) {
        // Logging pentru erori și răspuns de eroare detaliat
        console.error('Eroare la adăugarea produsului:', err);
        res.status(500).json({ message: 'Ceva a mers prost', error: err.message });
    }
});

router.post('/updateproduct', async (req, res) => {
    try {
        const updatedProductData = req.body.updatedproduct;
        const productId = req.body.productid;

        await Product.findByIdAndUpdate(productId, updatedProductData);

        res.status(200).json({ message: 'Succes' });
    } catch (error) {
        console.error('Eroare la actualizarea produsului:', error);
        res.status(400).json({ message: 'Eroare la actualizarea produsului' });
    }
});
module.exports = router;
