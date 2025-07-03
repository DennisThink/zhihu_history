const http = require('http');
const url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
// 创建可写流（类似C的fopen）
const fileFd = fs.createWriteStream('zhihu_history.txt', {
  flags: 'a', // 'a'=追加模式，'w'=写入模式（覆盖）
  encoding: 'utf8'
});
// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 解析 URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObject = parsedUrl.query;
  const method = req.method.toUpperCase();
  const headers = req.headers;

  // 获取请求体数据
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // 设置 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // 选择路由处理程序
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' 
      ? router[trimmedPath] 
      : handlers.notFound;

    // 构造数据对象
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    };

    // 路由请求
    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;
      payload = typeof(payload) === 'object' ? payload : {};
      
      const payloadString = JSON.stringify(payload);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response: ', statusCode, payloadString);
      //解析并输出到markdown
      {
        var payLoadJson = JSON.parse(payloadString);
        var reqData = payLoadJson.receivedData;
        var fileString="|"+reqData.URL+"|"+reqData.Title+"|"+reqData.CreateTime+"|\n";
        console.log("FileString:  ",fileString);
        fileFd.write(fileString);
      }
    });
  });
});

// 定义处理程序
const handlers = {};

// Hello 处理程序
handlers.hello = (data, callback) => {
  callback(200, { 
    message: 'Welcome to the simple HTTP server!',
    receivedData: data.payload ? JSON.parse(data.payload) : null
  });
};

// Not Found 处理程序
handlers.notFound = (data, callback) => {
  callback(404, { error: 'Route not found' });
};

// 定义路由
const router = {
  'hello': handlers.hello
};

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});