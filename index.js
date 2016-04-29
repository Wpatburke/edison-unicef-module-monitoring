var mraa = require('mraa');
var exec = require('child_process').exec;
var touchSensorDriver = require('jsupm_mpr121');

var touchSensor = new touchSensorDriver.MPR121(touchSensorDriver.MPR121_I2C_BUS, touchSensorDriver.MPR121_DEFAULT_I2C_ADDR);
touchSensor.configAN3944();

var touchInterruptPin = new mraa.Gpio(8);
touchInterruptPin.dir(mraa.DIR_IN);
touchInterruptPin.isr(mraa.EDGE_BOTH, isrTouchSensorCallback);

function isrTouchSensorCallback() {
    // DO NOT ADD ANYTHING HERE, EVEN THE LOGGER CRASHES IT!!!
}
logger("START MONITORING");

var touchCount = 0;
var touchInterval = null;

main();

function main() {
    // start collecting touch data
    touchCount = 0;
    touchInterval = setInterval(touchCounter, 1000);

    logger("Collecting data for 5s");
    startCapturingTouchSensorData();
    captureVideo(function (output) {
        logger(output);
        stopCapturingTouchSensorData();
        logger("Video captured. Going to sleep...");

        // stop interval
        clearInterval(touchInterval);
        // try to unlock one more time right after going to sleep
        touchCounter();
        logger("Total touches registered in session " + touchCount);
        sleep(function () {
            main();
        }, function () {
            logger("Unable to sleep. Rebooting... (NOT IMPLEMENTED)");
            // reboot here or something
            main();
        });
    }, function () {
        stopCapturingTouchSensorData();
        logger("ERROR when capturing video. Rebooting... (NOT IMPLEMENTED)");
        main();
    });
}

function startCapturingTouchSensorData() {
    logger("START capturing touch sensor data");
}

function stopCapturingTouchSensorData() {
    logger("STOP capturing touch sensor data");
}

function sleep(callbackOk, callbackError) {
    var command = "/home/root/scripts/sleep.sh";
    exec(command, function (error, stdout, stderr) {
        if (!error) {
            callbackOk();
        } else {
            logger("ERROR  " + stderr + stderr);
            callbackError();
        }
    });
}

function captureVideo(callbackOk, callbackError) {
    var command = "./scripts/fakeFfmpeg.sh";
    exec(command, function (error, stdout, stderr) {
        if (!error) {
            callbackOk(stdout);
        } else {
            logger("ERROR  " + stderr + " - " + error);
            callbackError(stderr);
        }
    });
}

function logger(msg) {
    console.log(msg);
}

function heartbeat() {
    if (!touchInterruptPin) {
        logger("ERROR ISR pin undefined");
    }
    logger("beep ");
}

function touchCounter() {
    touchSensor.readButtons();
    if (touchSensor.m_buttonStates) {
        touchCount++;
        logger("Unlocking touch. Count=" + touchCount);
    }
}

setInterval(heartbeat, 1000);




