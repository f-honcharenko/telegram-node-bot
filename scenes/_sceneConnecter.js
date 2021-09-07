const userScene = require('./userScene');
const moderScene = require('./moderScene');
const workerScene = require('./workerScene');
const adminScene = require('./adminScene');
const myFormsScene = require('./myFormsScene');
const groupChatScene = require('./groupChatScene');
const createFormScene = require('./createFormScene');
const workerFromsScene = require('./workerFromsScene');
const doneOrderScene = require('./doneOrderScene');
const makeModerScene = require('./makeModerScene');
const makeWorkerScene = require('./makeWorkerScene');
const makeCommentScene = require('./makeCommentScene');
const makeFormScene = require('./makeFormScene');
const accountingScene = require('./accountingScene');
const primaryScene = require('./primaryScene');
const taxAccountingScene = require('./taxAccountingScene');
const consultationScene = require('./consultationScene');
const makeOtherReportingScene = require('./makeOtherReportingScene');
const unlockingTaxInvoicesScene = require('./unlockingTaxInvoicesScene');
const customsBrokerServicesScene = require('./customsBrokerServicesScene');
const mainConsultationsScene = require('./mainConsultationsScene');




const scenes = [
    userScene,
    consultationScene,
    accountingScene,
    mainConsultationsScene,
    customsBrokerServicesScene,
    unlockingTaxInvoicesScene,
    makeOtherReportingScene,
    taxAccountingScene,
    primaryScene,
    moderScene,
    workerScene,
    adminScene,
    myFormsScene,
    groupChatScene,
    createFormScene,
    workerFromsScene,
    doneOrderScene,
    makeModerScene,
    makeWorkerScene,
    makeCommentScene,
    makeFormScene
];

module.exports = scenes;