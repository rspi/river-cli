import fetch from 'node-fetch';
import {host, metafile, username, password} from './config';

let metaDataPromise = fetch(host + metafile, {
  headers: {
    Authorization: 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  }
}).then(res => {
  if (res.status >= 200 && res.status < 300) {
    return res;
  }
  let error = new Error(res.statusText);
  error.code = res.status;
  throw error;
})
.then(res => {
  return res.json();
});

export {metaDataPromise};

