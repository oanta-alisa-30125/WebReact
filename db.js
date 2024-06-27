const mongoose =require("mongoose");

var mongoDBURL='mongodb+srv://alisa:alisa@cluster0.xv3dxrg.mongodb.net/website'

mongoose.connect(mongoDBURL, {useUnifiedTopology:true, useNewUrlParser:true})

var dbconnect=mongoose.connection

dbconnect.on('error',()=>{
    console.log('Mongo DB conexiune eșuată');
})

dbconnect.on('connected',()=>{
    console.log('Mongo DB conexiune reușită');
})

module.exports=mongoose