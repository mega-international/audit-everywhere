/* eslint-disable no-plusplus */

// eslint-disable-next-line import/no-unresolved
import store from '@/store.js';

const image = new Image();
let tStart = null;
let tEnd = null;
let counter = 0;
let arrTimes = [];
let abortFallback = false;

/**
 * The checkConnectivity method is used to test le latency of the connection
 * Default params :
 * - url = 'https://www.google.com/images/phd/px.gif'
 * - timeToCount = 3
 * - threshold = 3000
 * - interval = 6000
 * @param {Object} param0 The check connectivity config object
 */
// eslint-disable-next-line object-curly-newline
export default function checkConnectivity({ url = 'https://www.google.com/images/phd/px.gif', timeToCount = 3, threshold = 3000, interval = 6000 }) {
  if (navigator.onLine) {
    changeConnectivity(true);
  } else {
    timeoutFallback(threshold);
  }

  window.addEventListener('online', () => changeConnectivity(true));
  window.addEventListener('offline', () => timeoutFallback(threshold));

  timeoutFallback(threshold);
  checkLatency(url, timeToCount, threshold, avg => handleLatency(avg, threshold));
  setInterval(() => {
    reset();
    timeoutFallback(threshold);
    checkLatency(url, timeToCount, threshold, avg => handleLatency(avg, threshold));
  }, interval);
}

/**
 * The checkLatency method execute a number off HTTP request to a certain endpoint
 * In order to determine an average connectivity latency, regarding the given threshold
 * It determine if the user is offline or not
 * @param {String} url The URL to be tested
 * @param {Number} timeToTest the number of time to test for the average
 * @param {Number} threshold The average time limit of latency
 * @param {Function} cb The function to call after the average has been calculated
 */
function checkLatency(url, timeToTest, threshold, cb) {
  tStart = new Date().getTime();
  if (counter < timeToTest) {
    image.src = `${url}?t=${tStart}`;
    image.onload = () => {
      abortFallback = true;
      tEnd = new Date().getTime();
      const time = tEnd - tStart;
      arrTimes.push(time);
      counter++;
      checkLatency(url, timeToTest, threshold, cb);
    };
    image.onerror = () => {
      timeoutFallback(threshold);
    };
  } else {
    const sum = arrTimes.reduce((a, b) => a + b);
    const avg = sum / arrTimes.length;
    cb(avg);
  }
}

/**
 * Reset all the test data
 */
function reset() {
  abortFallback = false;
  counter = 0;
  arrTimes = [];
}

/**
 * The handleLatency method handle the check connectivity result
 * @param {Number} avg The average in ms of response time
 * @param {Number} threshold The average time limit of latency
 */
function handleLatency(avg, threshold) {
  const isConnectedFast = avg <= threshold;
  changeConnectivity(isConnectedFast);
}

/**
 * The changeConnectivity method dispatch the connectivity status change
 * @param {Boolean} state The connectivity state regarding the threshold
 */
function changeConnectivity(state) {
  store.dispatch('connectionChanged', {
    online: state
  });
}

/**
 * The timeoutFallback Handle the case where no response is receive after the threshold limit
 * @param {Number} threshold The average time limit of latency
 */
function timeoutFallback(threshold) {
  window.setTimeout(() => {
    if (!abortFallback) {
      console.log('connectivity is too slow, falling back on offline');
      changeConnectivity(false);
      reset();
    }
  }, threshold + 1);
}
