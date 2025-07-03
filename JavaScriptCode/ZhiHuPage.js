/**
 * 这是需要在知乎页面执行的js代码，其中每次只需要修改开始索引的值就好了
 * startIndex 开始采集的起始页面
 * howManyPages 一共采集多少条数据
 * localServerURL 本地服务器的地址
 */


var startIndex=19860440;
var howManyPages=1000;
var localServerURL="http://127.0.0.1:3000/hello";

class CZhiHuHistoryStruct{
    constructor(url, title,createTime) {
        this.url = url;
        this.title = title;
        this.createTime=createTime;
    }

    greet() {
        return `URL: ${this.url}, Title: ${this.title}, Time: ${this.createTime}`;
    }

    isOK(){
        if(this.url !="" && this.title != "" && this.createTime!=""){
            return true;
        }else{
            return false;
        }
    }
}

function GetSleepPeriod(maxSeconds){
    var sleepTime = Math.random()*maxSeconds;
    var intSleepTime = Math.floor(sleepTime);
    return intSleepTime; 
}

function zhihuSleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms*1000));
}

function GetQuestionUrl(startIndex,indexOffSet){
  var Http_URL_HEAD="https://www.zhihu.com/question/";
  var questionId=""+(startIndex+indexOffSet);
  var Http_Url_tail ="/log"
  var questionUrl = Http_URL_HEAD+questionId+Http_Url_tail;
  console.log("URL: ",questionUrl);
  return questionUrl;
}


async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json', // 内容类型
    },
    body: JSON.stringify(data), // 将数据转换为JSON字符串
  });
  return response.json(); // 解析JSON响应
}


function ParseUrl(htmlUrl,htmlContent){
    var retUrl="";
    var retTitle="";
    var retCreateTime="";

    retUrl = htmlUrl;
    console.log("ParseUrl 解析文件");
    // 创建解析器实例
    const parser = new DOMParser();
    // 解析HTML字符串
    const doc = parser.parseFromString(htmlContent, "text/html");

    const titleElement = doc.getElementById("zh-question-title");
    if(titleElement){
        var aTitle = titleElement.querySelector('a');
        if(aTitle)
    {
        console.log("Title: ",aTitle.textContent);
        retTitle = aTitle.textContent;
    }
}
else{
    console.log("GetTitleFailed");
}
    const divElements = doc.querySelectorAll('div.zm-item-meta');

    // 可以对选中的元素进行操作
    divElements.forEach(div => {
        console.log(div);
        {
            var divElement = div;
            const timeElement = divElement.querySelector('time');

            if (timeElement) {
                // 输出time元素的内容（textContent/innerText）
                console.log(timeElement.textContent);
                
                // 如果time元素有datetime属性，也可以输出
                if (timeElement.hasAttribute('datetime')) {
                    console.log(timeElement.getAttribute('datetime'));
                    retCreateTime = timeElement.getAttribute('datetime');
                }
            } else {
                console.log('没有找到time元素');
            }
        }
        // 例如修改样式
        div.style.color = 'red';
    });
    //格式化字符串，去掉多余的换行
    {
        var result = retTitle.replaceAll("\n","");
        retTitle=result;
    }
    return new CZhiHuHistoryStruct(retUrl,retTitle,retCreateTime);
}

async function fetchPageContent(url) {
  var retResult = new CZhiHuHistoryStruct("1","2","3");
  try {
    const response = await fetch(url);
    const html = await response.text();
    var retResult2 = ParseUrl(url,html);
    console.log("fetchPageContent Succeed");
    console.log(retResult2.greet());
    if(retResult2.isOK()){
        const userData={"URL":retResult2.url,"Title":retResult2.title,"CreateTime":retResult2.createTime};
        await postData("http://127.0.0.1:3000/hello",userData);
    }else{
        console.log("Get Result Failed");
    }

    //console.log(html);

    return retResult2;
  } catch (error) {
    console.error('获取页面内容失败:', error);
    return retResult;
  }
}

async function PluginFunction(){
    var index=0;
    var questionUrl="";
    for(index = 0 ;index < howManyPages ; index++){
        questionUrl=GetQuestionUrl(startIndex,index);
        console.log("PluginUrl : ",questionUrl);
        var sleepTime = GetSleepPeriod(5);
        console.log("Sleep: ",sleepTime);
        await zhihuSleep(sleepTime);
        var htmlContext=fetchPageContent(questionUrl);
    }
}

PluginFunction();