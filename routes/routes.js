const url = require('url');
const data_log = require('../models/common/data.js');
const QueryParams = require('../models/common/httparams.js');
const fs = require('fs');
const Cryptjs = require('crypto-js');
const My_Func = require('./My_Func.js');
const request = require('request');
module.exports =
    /**
     *
     * @param {*} app
     * @param {passport} passport
     */
    function (app, passport) {
        app.use('/api/Course_Search', require('./api/Course_Search'));
        app.use('/api/pdfmake', require('./api/pdfmake'));
        app.use('/api/announcement', require('./api/announcement'));

        app.get('/', function (req, res) {
            res.header(
                'Cache-Control',
                'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0 '
            );
            res.redirect('/Course_Search');
        });

        //#region web view
        app.get('/Course_Search', function (req, res) {
            res.header(
                'Cache-Control',
                'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            );
            res.set('Cache-Control', 'public, max-age=0');
            res.render('./atm/Course_Search.html');
        });

        app.get('/announcement', function (req, res) {
            res.header(
                'Cache-Control',
                'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            );
            res.set('Cache-Control', 'public, max-age=0');
            res.render('./atm/Announcement.html');
        });

        //#endregion

        app.get('/privacy-policy', function (req, res) {
            res.header(
                'Cache-Control',
                'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
            );
            // res.locals.CurrentUser = req.user;
            res.render('./atm/privacy-policy.html');
        });

        app.route('/*').get((req, res) => {
            res.status(404).json({
                status: 404,
                message: 'not found',
            });
        });
    };

async function Get_Date_YYYYMM() {
    return new Promise((resolve) => {
        var year = new Date().getFullYear();
        var month = new Date().getUTCMonth() + 1;
        var yyyymm = year.toString() + month.toString();
        return resolve(yyyymm);
    });
}
