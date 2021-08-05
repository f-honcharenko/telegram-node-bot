const userScene = require('./userScene');
const moderScene = require('./moderScene');
const workerScene = require('./workerScene');
const adminScene = require('./adminScene');
const myFormsScene = require('./myFormsScene');
const groupChatScene = require('./groupChatScene');
const createFormScene = require('./createFormScene');
const workerFromsScene = require('./workerFromsScene');
const doneOrderScene = require('./doneOrderScene');


const scenes = [
    userScene,
    moderScene,
    workerScene,
    adminScene,
    myFormsScene,
    groupChatScene,
    createFormScene,
    workerFromsScene,
    doneOrderScene
];

module.exports = scenes;