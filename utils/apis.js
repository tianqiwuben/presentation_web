import axios from 'axios';

const API_PREFIX = 'http://localhost:3003';

function getAPIHeaders() {
  return ({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  });
}


function callAPI(path, method, payload = null) {
  const headers = getAPIHeaders();
  const data = method === 'get' ? null : payload;
  return axios({
    url: path,
    method,
    data,
    headers,
    baseURL: API_PREFIX,
    params: method === 'get' ? payload : null,
    transformRequest: (dt) => {
      if (typeof dt === 'object') {
        return JSON.stringify(dt);
      } else {
        return dt;
      }
    }
  }).catch(error => {
    return error.response;
  });
}

function uploadAPI(path, file, onUploadPct = null) {
  const config = {
    onUploadProgress: function(progressEvent) {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      onUploadPct && onUploadPct(percentCompleted);
    }
  }

  let data = new FormData()
  data.append('file', file);

  return axios.post(API_PREFIX + path, data, config)
}


export const uploadFile = (file, cb) => uploadAPI('/pitches', file, cb);

export const getAllPitches = (page) => callAPI(`/pitches?page=${page}`, 'get');

export const deletePitch = (pid) => callAPI(`/pitches/${pid}`, 'delete');

export const getPitch = (pid, view) => callAPI(`/pitches/${pid}?view=${view}`, 'get');
