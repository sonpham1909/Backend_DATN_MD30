const mongoose = require('mongoose');


const database = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('MongoDB connected');
        
    } catch (error) {
        console.error('MongoDB connection error: ', error);
        throw error;
        
        
    }
}

module.exports = database;