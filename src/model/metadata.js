import fetch from 'node-fetch';
import {host, metafile} from './config';

let metaDataPromise = fetch(host + metafile).then(res => res.json());

export {metaDataPromise};

