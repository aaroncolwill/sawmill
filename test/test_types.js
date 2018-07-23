var sawmill = require('../lib/sawmill');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

sawmill.createLog({
    name: 'test',
    directory: path.join(__dirname, '../test_logs'),
    extendObject: true,
    toconsole: false,
    tags: ['*']
});

describe('Logging Types',() => {
    describe('Object', () => {
        it('Should be stringified', (done) => {
            let logmessage = {
                time: new Date().getUTCDate(),
                type: "DEBUG",
                message: "test message"
            }
            logmessage.debug();
            sawmill.get('test', (err, result) => {
                if(!err) {
                    assert.equal(JSON.parse(result)[0].message, JSON.stringify(logmessage));
                    done();
                }
            });
        });
    });

    describe('String', () => {
        it('Should be stringified', (done) => {
            let logmessage = "this is a log message for debug"
            logmessage.debug();
            sawmill.get('test', (err, result) => {
                if(!err) {
                    assert.equal(JSON.parse(result)[1].message, logmessage);
                    done();
                }
            });
        });
    });

    describe('JSON', () => {
        it('Should be stringified', (done) => {
            let logmessage = { "name": "tester", "success": "unknown" };
            logmessage.debug();
            sawmill.get('test', (err, result) => {
                if(!err) {
                    assert.equal(JSON.parse(result)[2].message, JSON.stringify(logmessage));
                    done();
                }
            });
        });
    });

    describe('XML', () => {
        it('Should be stringified', (done) => {
            let logmessage = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><test>this is a test message</test>';
            logmessage.debug();
            sawmill.get('test', (err, result) => {
                if(!err) {
                    assert.equal(JSON.parse(result)[3].message, logmessage);
                    done();
                }
            });
        });
    });
});
