/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('DataUriPlugin', () => {
  const retryParameters = shaka.net.NetworkingEngine.defaultRetryParameters();

  it('supports MIME types', (done) => {
    testSucceeds('data:text/plain,Hello', 'text/plain', 'Hello', done);
  });

  it('supports URI encoded text', (done) => {
    testSucceeds(
        'data:text/html,%3Ch1%3EHello%2C%20World!%3C%2Fh1%3E',
        'text/html',
        '<h1>Hello, World!</h1>',
        done);
  });

  it('supports base64 encoded text', (done) => {
    testSucceeds(
        'data:;base64,SGVsbG8sIFdvcmxkIQ%3D%3D', '', 'Hello, World!', done);
  });

  it('supports extra colin', (done) => {
    testSucceeds('data:,Hello:', '', 'Hello:', done);
  });

  it('supports extra semi-colin', (done) => {
    testSucceeds('data:,Hello;', '', 'Hello;', done);
  });

  it('supports extra comma', (done) => {
    testSucceeds('data:,Hello,', '', 'Hello,', done);
  });

  it('fails for empty URI', (done) => {
    testFails('', done, shaka.util.Error.Code.MALFORMED_DATA_URI);
  });

  it('fails for non-data URIs', (done) => {
    testFails('http://google.com/', done,
        shaka.util.Error.Code.MALFORMED_DATA_URI);
  });

  it('fails for decoding errors', (done) => {
    testFails('data:Bad%', done, shaka.util.Error.Code.MALFORMED_DATA_URI);
  });

  it('fails if missing comma', (done) => {
    testFails('data:Bad', done, shaka.util.Error.Code.MALFORMED_DATA_URI);
  });

  function testSucceeds(uri, contentType, text, done) {
    // An arbitrary request type.
    const requestType = shaka.net.NetworkingEngine.RequestType.SEGMENT;
    // A dummy progress callback.
    const progressUpdated = (elapsedMs, bytes, bytesRemaining) => {};

    const request =
        shaka.net.NetworkingEngine.makeRequest([uri], retryParameters);
    const op = shaka.net.DataUriPlugin.parse(
        uri, request, requestType, progressUpdated);
    op.promise.then((response) => {
      expect(response).toBeTruthy();
      expect(response.uri).toBe(uri);
      expect(response.data).toBeTruthy();
      expect(response.headers['content-type']).toBe(contentType);
      const data =
          shaka.util.StringUtils.fromBytesAutoDetect(response.data);
      expect(data).toBe(text);
    }).catch(fail).then(done);
  }

  function testFails(uri, done, code) {
    // An arbitrary request type.
    const requestType = shaka.net.NetworkingEngine.RequestType.SEGMENT;
    // A dummy progress callback.
    const progressUpdated = (elapsedMs, bytes, bytesRemaining) => {};

    const request =
        shaka.net.NetworkingEngine.makeRequest([uri], retryParameters);
    const op = shaka.net.DataUriPlugin.parse(
        uri, request, requestType, progressUpdated);
    op.promise
        .then(fail)
        .catch((error) => { expect(error.code).toBe(code); })
        .then(done);
  }
});

