const {
    Schema,
    model
} = require('mongoose');


const userSchema = new Schema({
    telegramID: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
    }
}, {
    collection: 'users'
}, {
    timestamps: true
}, );

module.exports = model('User', userSchema);