let moment  = require('node.date-time');
let timeRequest = ' Время запроса: ';
module.exports = function (ipUser, typeReq, url){
return timeRequest + new Date().format('Y-MM-dd HH:mm:SS')+" | IP пользователя: "+ipUser+" | Тип запроса: "+typeReq+" |URL: "+url;
};
