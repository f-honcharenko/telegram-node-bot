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
    telegramFirstName: {
        type: String,
        required: false,
    },
    telegramLastName: {
        type: String,
        required: false,
    },
    telegramLogin: {
        type: String,
        required: false,
    },
    type: {
        type: String,
        required: true,
    },
    // orders: {
    //     required: false,

    //     completed: {
    //         type: Number,
    //         default: 0
    //     },
    //     pending: {
    //         type: Number,
    //         default: 0
    //     },
    //     canceled: {
    //         type: Number,
    //         default: 0
    //     },
    // }
}, {
    collection: 'users'
}, {
    timestamps: true
}, );

module.exports = model('User', userSchema);