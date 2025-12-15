import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathRendererProps {
  expression: string; // This now represents the FULL message content (Markdown + Math)
  textColor?: string;
}

export default function MathRenderer({ expression, textColor = '#000000' }: MathRendererProps) {
  const [height, setHeight] = useState(100);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 8px; /* Add padding to prevent clipping */
            background-color: transparent; 
            font-family: -apple-system, Roboto, sans-serif;
            font-size: 15px;
            line-height: 1.5;
            color: ${textColor};
            overflow: hidden; /* Prevent scrollbars from affecting width */
          }
          p { margin: 0 0 10px 0; }
          .katex { font-size: 1.1em !important; }
          .katex-display { margin: 1em 0; overflow-x: auto; overflow-y: hidden; }
        </style>
      </head>
      <body>
        <div id="content"></div>
        <script>
          function sendHeight() {
            // Calculate height more robustly
            const bodyH = document.body.scrollHeight;
            const contentH = document.getElementById('content').scrollHeight;
            const maxH = Math.max(bodyH, contentH);
            window.ReactNativeWebView.postMessage(maxH.toString());
          }

          try {
            // 1. Parse Markdown
            const rawContent = String.raw\`${expression.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
            document.getElementById('content').innerHTML = marked.parse(rawContent);

            // 2. Render Math
            renderMathInElement(document.getElementById('content'), {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
              ],
              throwOnError: false
            });

            // 3. Send Height with ResizeObserver
            const ro = new ResizeObserver(entries => {
               sendHeight();
            });
            ro.observe(document.body);
            ro.observe(document.getElementById('content'));
            
            // 4. Polling to catch late renders (fonts, math layout)
            sendHeight();
            setTimeout(sendHeight, 100);
            setTimeout(sendHeight, 300);
            setTimeout(sendHeight, 500);
            setTimeout(sendHeight, 1000);

          } catch(e) {
            document.getElementById('content').innerText = "Stack Error: " + e.toString();
            sendHeight();
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height: height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ backgroundColor: 'transparent' }}
        scrollEnabled={false}
        onMessage={(event) => {
          const h = parseInt(event.nativeEvent.data);
          if (!isNaN(h) && h > 0) {
            // Add a small buffer to prevent clipping
            setHeight(h + 10);
          }
        }}
        androidLayerType="hardware"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
