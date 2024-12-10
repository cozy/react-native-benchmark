import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';
import { WebView } from 'react-native-webview';

function generateRandomString(length: number) {
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }
  return result;
}

const smallRandomString = generateRandomString(100);
const mediumRandomString = generateRandomString(10000);
const bigRandomString = generateRandomString(1000000);

// With postMessage

// 1. RN load a webview
// 2. RN send a start event to webview
// 3. Webview start a timer
// 4. Webview send a ping event to RN
// 5. RN send a pong event to webview with a payload
// 6. Webview end the timer
// 7. Webview send the result to RN
// 8. RN display the result

// With httpServer

// 1. RN load a webview
// 2. RN send a start event to webview
// 3. Webview start a timer
// 4. Webview a request to the http server
// 5. Webview get the answer from the http server
// 6. Webview end the timer
// 7. Webview send the result to RN
// 8. RN display the result

const MyWebView = ({ dataType }: { dataType: string }) => {
  const webviewRef = useRef();
  const [postMessageResults, setPostMessageResults] = React.useState<number[]>([]);
  const [httpServerResults, setHttpServerResults] = React.useState<number[]>([]);

  let testData: any;

  if (dataType === 'small') {
    testData = smallRandomString;
  } else if (dataType === 'medium') {
    testData = mediumRandomString;
  } else if (dataType === 'big') {
    testData = bigRandomString;
  }

  const html = `
    <html>
    <head></head>
    <body>
      <script>
        const dataType = "${dataType}"; 

        let t0 = 0;
        let t1 = 0;

        window.document.addEventListener('message', function ({ data }) {
          const { message } = JSON.parse(data);

          if (message === 'startPostMessage') {
            startPostMessage();
          } if (message === 'startHttpServer') {
            startHttpServer();
          } else if (message === 'pong') {
            endPostMessage();
          }
        });

        const startPostMessage = () => {
          t0 = performance.now();
          
          const data = JSON.stringify({ message: 'ping' });
          window.ReactNativeWebView.postMessage(data);
        }

        const endPostMessage = () => {
          t1 = performance.now();

          const result = t1 - t0;

          const data = JSON.stringify({ message: 'postMessageResult', result });
          window.ReactNativeWebView.postMessage(data);
        }

        const startHttpServer = () => {
          t0 = performance.now();
          
          fetch('http://127.0.0.1:36666/' + dataType)
            .then((response) => response.json())
            .then((res) => {
              t1 = performance.now();

              const result = t1 - t0;

              const data = JSON.stringify({ message: 'httpServerResult', result });
              window.ReactNativeWebView.postMessage(data);
            })
        }
        </script>
    </body>
    </html>
  `;

  const onMessage = (event) => {
    const message = JSON.parse(event.nativeEvent.data);

    if (message.message === 'ping') {
      const pong = JSON.stringify({ message: 'pong', testData });
      webviewRef.current.postMessage(pong);
    } else if (message.message === 'postMessageResult') {
      setPostMessageResults(prev => [...prev, message.result]);
    } else if (message.message === 'httpServerResult') {
      setHttpServerResults(prev => [...prev, message.result]);
    }
  };

  // With postMessage

  const onStartPostMessage = () => {
    webviewRef.current.postMessage(JSON.stringify({ message: 'startPostMessage'}));
  };

  // With httpServer

  const onStartHttpServer = () => {
    webviewRef.current.postMessage(JSON.stringify({ message: 'startHttpServer'}));
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Start postMessage test"
        onPress={onStartPostMessage}
      />
      <Button
        title="Start httpServer test"
        onPress={onStartHttpServer}
      />
      <Button
        title="Clean results"
        onPress={() => {
          setPostMessageResults([]);
          setHttpServerResults([]);
        }}
      />

      <View style={{ flex: 1 }}>
        {/* ##### postMessage results ##### */}
        <Text style={{ fontSize: 22, fontWeight: 700 }}>postMessage results:</Text>
        {postMessageResults.map((postMessageResult, index) => (
          <Text key={index}>{index}) {postMessageResult} ms</Text>
        ))}
        {postMessageResults.length > 0 && <Text style={{ fontWeight: 700 }}>Average: {postMessageResults.reduce((a, b) => a + b, 0) / postMessageResults.length} ms</Text>}

        {/* ##### httpServer results ##### */}
        <Text style={{ fontSize: 22, fontWeight: 700 }}>httpServer results:</Text>
        {httpServerResults.map((httpServerResult, index) => (
          <Text key={index}>{index}) {httpServerResult} ms</Text>
        ))}
        {httpServerResults.length > 0 && <Text style={{ fontWeight: 700 }}>Average: {httpServerResults.reduce((a, b) => a + b, 0) / httpServerResults.length} ms</Text>}
      </View>

      <WebView
        ref={webviewRef}
        source={{ html, baseUrl: 'http://127.0.0.1:36666' }}
        originWhitelist={['*']}
        onMessage={onMessage}
      />
    </View>
  );
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [dataType, setDataType] = useState('small');

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            <Text>Using {global?.nativeFabricUIManager ? 'new' : 'old'} arch</Text>
            <Text>Data type: {dataType}</Text>
            <View style={styles.container}>
              <View style={styles.buttonRow}>
                <Button title="small" onPress={() => setDataType('small')} />
                <Button title="medium" onPress={() => setDataType('medium')} />
                <Button title="big" onPress={() => setDataType('big')} />
              </View>
            </View>
          <MyWebView dataType={dataType}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
});
