const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const WS_URL = 'http://localhost:8080/ws';

function runTest() {
  return new Promise((resolve, reject) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      debug: function (str) { /* console.log(str); */ },
      onConnect: function (frame) {
        let received = false;
        client.subscribe('/topic/beats', msg => {
          const body = msg.body;
          console.log('Received on /topic/beats:', body);
          received = true;
          client.deactivate();
          resolve(true);
        });

        // send a sample beat
        const payload = JSON.stringify({ pattern: JSON.stringify([[true,false],[false,true]]) });
        client.publish({ destination: '/app/beat', body: payload });

        // timeout if nothing received
        setTimeout(() => {
          if (!received) {
            client.deactivate();
            reject(new Error('No message received on /topic/beats within timeout'));
          }
        }, 3000);
      },
      onStompError: function (frame) {
        reject(new Error('STOMP error: ' + frame.headers['message']));
      }
    });

    client.activate();
  });
}

runTest().then(() => { console.log('Integration test passed'); process.exit(0); }).catch(err => { console.error('Integration test failed:', err.message); process.exit(1); });
