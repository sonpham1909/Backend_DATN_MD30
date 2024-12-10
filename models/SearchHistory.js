const mongoose = require('mongoose');

const SearchSchemma = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    search_term:{
        type: String,
        required:true
    }
},{timestamps: true});

module.exports = mongoose.model('SearchHistory',SearchSchemma);