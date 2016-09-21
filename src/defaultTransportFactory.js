import fetchRequest from './fetch';
import { makeXhrTransport } from './xhr';

let selected = null;

export default function defaultTransportFactory() {
  if (!selected) {
    if (window.Response && window.Response.prototype.hasOwnProperty("body")) {
      selected = fetchRequest;
    } else {
      const tmpXhr = new XMLHttpRequest();
      const mozChunked = 'moz-chunked-arraybuffer';
      tmpXhr.responseType = mozChunked;
      if (tmpXhr.responseType === mozChunked) {
        selected = makeXhrTransport({
          responseType: mozChunked,
          responseParserFactory: function () {
            return response => new Uint8Array(response);
          }
        });
      } else {
        selected = makeXhrTransport({
          responseType: 'text',
          responseParserFactory: function () {
            const encoder = new TextEncoder();
            let offset = 0;
            return function (response) {
              const chunk = response.substr(offset);
              offset = response.length;
              return encoder.encode(chunk, { stream: true });
            }
          }
        });
      }
    }
  }
  return selected;
}

