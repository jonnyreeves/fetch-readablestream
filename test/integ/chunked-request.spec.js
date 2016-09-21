import fetchStream from '../../src/index';
import { Headers as HeadersPolyfill } from '../../src/polyfill/Headers';
import { drainResponse, decodeUnaryJSON } from './util';

if (!window.Headers) {
  window.Headers = HeadersPolyfill;
}

// These integration tests run through Karma; check `karma.conf.js` for
// configuration.  Note that the dev-server which provides the `/srv`
// endpoint is proxied through karma to work around CORS constraints.

describe('fetch-readablestream', () => {

  it('returns each chunk sent by the server as a Uint8Array of bytes', (done) => {
    return fetchStream('/srv?method=send-chunks', {
      method: 'POST',
      body: JSON.stringify([ 'chunk1', 'chunk2' ])
    })
        .then(drainResponse)
        .then(chunks => {
          expect(chunks.length).toBe(2, '2 chunks received');
          expect(chunks.every(bytes => bytes.BYTES_PER_ELEMENT === 1)).toBe(true, 'Uint8Array');
        })
        .then(done, done);
  });

  it('will cancel the response stream and close the connection', (done) => {
    return fetchStream('/srv?method=send-chunks', {
      method: 'POST',
      body: JSON.stringify([ 'chunk1', 'chunk2', 'chunk3', 'chunk4' ])
    })
        .then(response => {
          const reader = response.body.getReader();
          return reader.read()
              .then(() => reader.cancel())
        })
        .then(() => fetchStream('/srv?method=last-request-closed'))
        .then(drainResponse)
        .then(decodeUnaryJSON)
        .then(result => {
          expect(result.value).toBe(true, 'response was closed by client');
        })
        .then(done, done);
  });

  it('returns a subset of the fetch API', (done) => {
    return fetchStream('/srv?method=echo', {
      method: 'POST',
      body: "hello world",
    })
        .then(result => {
          expect(result.ok).toBe(true);
          expect(result.headers.get('x-powered-by')).toBe('nodejs');
          expect(result.status).toBe(200);
          expect(result.statusText).toBe('OK');
          expect(result.url).toBe('http://localhost:9876/srv?method=echo');
        })
        .then(done, done);
  });

  it('resolves the fetchStream Promise on server error', (done) => {
    return fetchStream('/srv?method=500')
        .then(result => {
          expect(result.status).toBe(500);
          expect(result.ok).toBe(false);
        })
        .then(done, done);
  });

  it('sends the expected values to the server', (done) => {
    return fetchStream('/srv?method=echo', {
      method: 'POST',
      body: "hello world",
      headers: new Headers({ 'x-foo': 'expected' })
    })
        .then(drainResponse)
        .then(decodeUnaryJSON)
        .then(res => {
          expect(res.method).toBe("POST");
          expect(res.body).toBe("hello world");
          expect(res.headers).toEqual(jasmine.objectContaining({ 'x-foo': 'expected' }));
        })
        .then(done, done);
  });

  it('includes cookies when credentials=include', (done) => {
    document.cookie = 'myCookie=myValue';

    return fetchStream('/srv?method=echo', {
      method: 'POST',
      credentials: 'include'
    })
        .then(drainResponse)
        .then(decodeUnaryJSON)
        .then(res => {
          expect(res.cookies).toEqual(jasmine.objectContaining({ myCookie: "myValue" }));
        })
        .then(done, done);
  });

  /* xhr will always send cookies to the same domain.
  it('omits cookies when credentials=omit', (done) => {
    document.cookie = 'myCookie=myValue';

    return fetchStream('/srv?method=echo', {
      method: 'POST',
      credentials: 'omit'
    })
        .then(drainResponse)
        .then(decodeUnaryJSON)
        .then(res => {
          expect(res.cookies).not.toEqual(jasmine.objectContaining({ myCookie: "myValue" }));
        })
        .then(done, done);
  });
  */

});
