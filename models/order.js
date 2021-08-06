const {
    Schema,
    model
} = require('mongoose');


const order = new Schema({
    creatorTelegramID: {
        type: String,
        required: true,
        unique: false
    },
    title: {
        type: String,
        required: true,
        unique: false
    },
    creationDate: {
        type: Date,
        required: true,
        unique: false
    },
    worker: {
        type: String,
        required: false,
        unique: false,
        default: null
    },
    status: {
        type: String,
        required: false,
        unique: false,
        default: 'pendingWorker'
    },
    rate: {
        type: Number,
        required: false,
        default: null
    },
    comment: {
        type: String,
        required: false,
        default: null
    },
    files: {
        type: [String],
        requires: false,
        default: []
    },
    userFiles: {
        type: [String],
        requires: false,
        default: []
    },
    userComment: {
        type: [String],
        required: false,
        default: null
    },
    // creationDate: {
    //     type: Date,
    //     required: true,
    // }
}, {
    collection: 'orders'
}, {
    timestamps: true
}, );

module.exports = model('Order', order);