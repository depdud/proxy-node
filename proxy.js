const net = require('net'),
http = require('http'),
url = require('url'),
logFile = require('./CreateLog'),
fs = require('fs'),
cluster = require('cluster'),
os =require('os'),
cpusCount = os.cpus().length;

//Функция обработки неверных запросов
function notFound(res){
		res.writeHead(404, "text/plain");
		res.end("404: File not found");
	}

//Инициализация процессов кластера
  if(cluster.isMaster){
    console.log(`Master ${process.pid} is running`);

    for(let i = 0; i < cpusCount-1; i++){
      cluster.fork();
    }

  cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {

// Создание нашего сервера через который будут осуществляться
// запросы к реальным серверам

http.createServer((req, res) => {
  const b_url = url.parse(req.url, true);
  if(!b_url.query || !b_url.query.url) return notFound(res);

  // Добавление информации в лог-файл
fs.appendFile('logFile.log', logFile(req.connection.remoteAddress,
req.method, req.url.slice(6))+'\n',function(){});

  // Парсинг юрл,введенного в качестве параметра в строке браузера
  const p_url = url.parse(b_url.query.url);
  // Инициализация запроса от имени прокси-сервера
  const p_req = http.request({
    port: p_url.port || 80,
    host: p_url.hostname,
    method: 'GET',
    path: p_url.pathname || "/"
  });

  p_req.end();
  // Добавление слушателя и от ответов на определенные сигналы
  p_req.addListener('response', function(p_res){
    res.writeHead(p_res.statusCode,p_res.headers);
    console.log('---response gotten');
    p_res.addListener('data', function(chunk){
      res.write(chunk);
      console.log('---data gotten');
    });

    p_res.addListener('end', function(){
      console.log('---end gotten');
      res.end();
    });
  })
}).listen(3000, "127.0.0.1");
console.log('---PROXY- works');
console.log(`Worker ${process.pid} started`);
}
