// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
/*------------------------------------------------------------

通过截图查看长高，通过高来设定数值

2778 weight:1092,height:510,large:1146

2532 weight:1014,height:474,large:1062

2688 weight:1080,height:507,large:1137

1792 weight:720,height:338,large:758
  
2436 weight:987,height:465,large:1035

2208 weight:1044,height:471,large:1071
  
1334 weight:642,height:296,large:648

1136 weight:584,height:282,large:622

------------------------------------------------------------*/

let weight = 1092
let height = 510

let D = 6

// info
let infoWeight = weight/Device.screenScale()-D*2
let infoHeight = 12

let uidSize = new Size(infoWeight/3,infoHeight)
let regionSize = new Size(infoWeight/9,infoHeight)
let signSize = new Size(infoWeight/9,infoHeight)

// daily
let dailyWeight = weight/Device.screenScale()-D*2-24
let dailyHeight = height/Device.screenScale()-D*2-infoHeight-D

let resinSize = new Size(dailyWeight/5,dailyHeight)
let coinSize = new Size(dailyWeight/5,dailyHeight)
let iconSize = new Size(dailyWeight/5/2,dailyWeight/5/2)

let taskSize = new Size(dailyWeight/5,dailyHeight/2)
let discountSize = new Size(dailyWeight/5,dailyHeight/2)
let recoverySize = new Size(dailyWeight/5,dailyHeight/2)
let expeditionSize = new Size(dailyWeight/5*3+2*6,dailyHeight/2-6)

let textcolor = Color.dynamic(new Color("3D4567"),new Color("E0D6C7"))
let bgcolor = Color.dynamic(new Color("E0D6C7",0.5),new Color("3D4657",0.5))
let label1 = Color.dynamic(new Color("C6BBAD"),new Color("313542"))
let label2 = Color.dynamic(new Color("31D154"),new Color("FF794A"))
let label3 = Color.dynamic(new Color("4B5566"),new Color("DACDBA"))

let API = {
    ID : "https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn",
    DAILY : "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote",
    SIGNINFO : "https://api-takumi.mihoyo.com/event/bbs_sign_reward/info",
    SIGNIN : "https://api-takumi.mihoyo.com/event/bbs_sign_reward/sign",
    SIGNGIFT : "https://api-takumi.mihoyo.com/event/bbs_sign_reward/award",
}

let iCloud = FileManager.iCloud()
let file = FileManager.local()

const imgPath = iCloud.joinPath(iCloud.documentsDirectory(), "Genshi Daily")
if (!iCloud.fileExists(imgPath) || !iCloud.isDirectory(imgPath)) { iCloud.createDirectory(imgPath) }

const CookiePath = iCloud.joinPath(iCloud.documentsDirectory(), "CookieLite.txt")

const HEADERS = { 
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) miHoYoBBS/2.34.1",
    "Referer": "https://webstatic.mihoyo.com/",
    "x-rpc-app_version": "2.34.1",
    "x-rpc-client_type": "5",
    "Cookie": "",
    "DS": ""
  }
  
const SIGN_HEADERS = {
      "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) miHoYoBBS/2.34.1",
      "Referer":"https://webstatic.mihoyo.com/bbs/event/signin-ys/index.html?bbs_auth_required=true&act_id=e202009291139501&utm_source=bbs&utm_medium=mys&utm_campaign=icon",
      "Accept": "application/json",
      "Accept-Encoding": "gzip, deflate",
      "X-Requested-With": "com.mihoyo.hyperion",
      "x-rpc-client_type": "5",
      "x-rpc-app_version": "2.34.1",
      "x-rpc-device_id":guid(),
      "DS": await getDS2()
}

if(config.runsInApp){
  
  if(! file.readString(CookiePath)){
    message = "米哈游Cookies获取"
    options = ["从网页获取","从输入获取"]
    const action = await generateAlert(message, options)
    if(action === 0){
      let cookie = await getCookies()
      iCloud.writeString(CookiePath, cookie)
    }else{await alert()}
    
   }else{
  
  message = "米游社实时便笺"
  options = ["更新Cookie","删除缓存","设置背景","米游社签到","预览组件","退出"]
  const action = await generateAlert(message, options)
 
  //更新Cookie
  if(action == 0){
  await alert()
}

//删除缓存
  if(action == 1)
  {message = `⚠️⚠️⚠️\n此操作会删除所有缓存数据包括Cookie\n\n确认是否删除？`;
options = ["确认","取消"]
let warning = await generateAlert(message, options)
if(warning == 0){
  iCloud.remove(CookiePath);iCloud.remove(imgPath)}
}

//背景设置
  if(action == 2){
  iCloud.writeImage(iCloud.joinPath(imgPath, "GenshinLite.jpg"), await Photos.fromLibrary())
}

//米游社签到
  if(action == 3){
let sign = await getSign()
  if(!sign.is_sign){
  let post = await postSign()
  }
  let gift = await getGift()
  let n = new Notification()
  n.title = gift.list[0].created_at
  n.subtitle = `「累计签到${gift.total}天」「本月签到${sign.total_sign_day}天」「漏签${sign.sign_cnt_missed}天」`
  n.body = `今天签到奖励：『${gift.list[0].name}*${gift.list[0].cnt}』`
n.sound = "complete"
await n.schedule()
}

//预览
  if(action == 4){
    message = "请选择预览大小"
    options = ["小组件","中组件","大组件"]
    let show = await generateAlert(message,options)
if(show == 0){let widget = await smallWidget()
widget.presentSmall()}
if(show == 1){let widget = await mediumWidget()
widget.presentMedium()}
if(show == 2){let widget = await largeWidget()
widget.presentLarge()}
  }
  if(action == 5)return
}
}

async function mediumWidget(){
let w = new ListWidget()
w.backgroundImage = iCloud.readImage(iCloud.joinPath(imgPath,"GenshinLite.jpg"))
if(!iCloud.readString(CookiePath)){
  w.addText("添加Cookie后使用").centerAlignText()}

// info
var stack = w.addStack()
let info = await getInfo()
let sign = await getSign()
let data = await getDaily()
// uid
let uidStack = await Stack(stack,uidSize,bgcolor,`${info[3]} ${info[0]}`)
stack.addSpacer(infoWeight*2/9)

// region
let regionStack = await Stack(stack,regionSize,bgcolor,info[2])
stack.addSpacer(infoWeight*2/9)
// sign
if(sign.is_sign){
  var textsign = "已签到"
}else{
  var textsign = "未签到"
}
let signStack = await Stack(stack,signSize,bgcolor,textsign)

w.addSpacer(6)
// daily
var stack = w.addStack()

// resin
let resinStack = stack.addStack()
resinStack.layoutVertically()
resinStack.size = resinSize
resinStack.cornerRadius = 8
resinStack.backgroundImage = getRect(resinSize, data.current_resin,data.max_resin,data.current_resin)
resinStack.backgroundColor = bgcolor
let resinIcon = await centerStack(resinStack, await loadResinIcon(), img=true)
stack.addSpacer(6)
// coin
let coinStack = stack.addStack()
coinStack.layoutVertically()
coinStack.size = coinSize
coinStack.backgroundImage = getRect(coinSize, data.current_home_coin,data.max_home_coin,data.current_home_coin)
coinStack.backgroundColor = bgcolor
coinStack.cornerRadius = 8
let coinIcon = await centerStack(coinStack, await loadCoinIcon(), img=true)
stack.addSpacer(6)

var dailyStack = stack.addStack()
dailyStack.layoutVertically()

var stack = dailyStack.addStack()
// task
let taskStack = stack.addStack()
taskStack.layoutVertically()
taskStack.size = taskSize
taskStack.backgroundColor = bgcolor
taskStack.cornerRadius = 8
let taskIcon = await centerStack(taskStack,await loadTaskIcon(),img=true)
let taskNumiconStack = taskStack.addStack()
taskNumiconStack.addSpacer()
if(!data.is_extra_task_reward_received){
  taskText = await centerStack(taskStack,"未领取",img=false,Font.boldRoundedSystemFont(10))}
for(var i=0;i<data.total_task_num-data.finished_task_num;i++){
  taskNumStack = taskNumiconStack.addStack()
  taskNumStack.addSpacer(1)
  let numSymbol = SFSymbol.named("heart.circle").image
  let numIcon = taskNumStack.addImage(numSymbol)
  numIcon.imageSize = new Size(10,10)
  taskNumStack.addSpacer(1)
}
taskNumiconStack.addSpacer()

stack.addSpacer(6)
// discounts
let discountStack = stack.addStack()
discountStack.layoutVertically()
discountStack.size = discountSize
discountStack.backgroundColor = bgcolor
discountStack.cornerRadius = 8
let discountIcon = await centerStack(discountStack,await loadDiscountIcon(),img=true)
let disNumiconStack = discountStack.addStack()
disNumiconStack.addSpacer()
for(var i=0;i<data.remain_resin_discount_num;i++){
  disNumStack = disNumiconStack.addStack()
  disNumStack.addSpacer(1)
  let numSymbol = SFSymbol.named("heart.circle").image
  let numIcon = disNumStack.addImage(numSymbol)
  numIcon.imageSize = new Size(10,10)
  disNumStack.addSpacer(1)
}
disNumiconStack.addSpacer()


stack.addSpacer(6)
// recovery
let recoveryStack = stack.addStack()
recoveryStack.layoutVertically()
recoveryStack.size = recoverySize
recoveryStack.backgroundColor = bgcolor
recoveryStack.cornerRadius = 8
let recoveryIcon = await loadTransformerIcon()
let recoveryTime = data.transformer.recovery_time
log(recoveryTime)
var percent = 100/168*(recoveryTime.Day*24+recoveryTime.Hour)
let h = recoverySize.width
var canvas = new DrawContext()
    canvas.size = recoverySize
    canvas.opaque = false
    canvas.respectScreenScale = true 
var rect = new Rect(h/2-15,recoverySize.height/2-15,30,30)
canvas.drawImageInRect(recoveryIcon, rect)

let ctr = new Point(h/2,h/2)
let path = new Path()
    path.move(ctr)
    path.addLine(new Point(h/2,0))
for (let t = 0; t < percent*3.6; t++) {
 let rect_x = ctr.x + 50 * Math.sin((t*Math.PI) / 180)
 let rect_y = ctr.y - 50 * Math.cos((t*Math.PI) / 180)
    path.addLine(new Point(rect_x, rect_y))
}
    canvas.setFillColor(new Color("000",0.5));
    canvas.addPath(path)
    canvas.fillPath()
    let recoverybg = recoveryStack.addStack()
    recoverybg.centerAlignContent()
    recoverybg.size = recoverySize
recoverybg.backgroundImage = canvas.getImage()
var text = ""
for(x in recoveryTime){
  if(recoveryTime[x] != 0){
text = String(recoveryTime[x]) + " " + x.slice(0,1)
let t = recoverybg.addText(text)
t.font = Font.boldRoundedSystemFont(16)
t.textColor = textcolor
  }}



dailyStack.addSpacer(6)
var stack = dailyStack.addStack()
// expedition
let expeditionStack = stack.addStack()
expeditionStack.centerAlignContent()
expeditionStack.size = expeditionSize
expeditionStack.backgroundColor = bgcolor
expeditionStack.cornerRadius = 8
log(data.expeditions.length)
for(var i=0;i<data.expeditions.length;i++){
  var exp = data.expeditions[i]
const avatarSide = exp.avatar_side_icon.split("_")
const sideNum = avatarSide.length-1
var expAvatar = avatarSide[sideNum].split(".")[0]
if(expAvatar == "Bennett" && expAvatar == "Chongyun" && expAvatar == "Fischl" && expAvatar == "Sara" && expAvatar == "Keqing"){var percent = 100-exp.remained_time*(100/54000)
}else{var percent = 100-exp.remained_time*(100/72000)}
  if(! iCloud.readImage(iCloud.joinPath(imgPath, avatarSide[sideNum]))){
  
iCloud.writeImage(iCloud.joinPath(imgPath, avatarSide[sideNum]),await getImage(exp.avatar_side_icon))}

  var avatarStack = expeditionStack.addStack()
  avatarStack.layoutVertically()
  var canvas = new DrawContext()
  canvas.size = new Size(128,128)
      canvas.opaque = false
      canvas.respectScreenScale = true
    let ctr = new Point(128/ 2, 128 / 2);
    let bgx = ctr.x - 50;
    let bgy = ctr.y - 50;
    let bgd = 2 * 50;
    let bgr = new Rect(bgx, bgy, bgd, bgd)

    canvas.setStrokeColor(label1);
    canvas.setLineWidth(6);
    canvas.strokeEllipse(bgr);

    for (let t = 0; t < percent*3.6; t++) {
      let rect_x = ctr.x + 50 * Math.sin((t * Math.PI) / 180) - 6 / 2;
      let rect_y = ctr.y - 50 * Math.cos((t * Math.PI) / 180) - 6 / 2;
      let rect_r = new Rect(rect_x, rect_y, 6,6);
      canvas.setFillColor(label3);
      canvas.fillEllipse(rect_r);
    }
  var img = iCloud.readImage(iCloud.joinPath(imgPath,avatarSide[sideNum]))
canvas.drawImageAtPoint(img, new Point(-5,-20))
  var iconStack = avatarStack.addStack()
  iconStack.addImage(canvas.getImage())
  
}
return w
}



async function Stack(stack,size,color,title){
  let Stack = stack.addStack()
  Stack.centerAlignContent()
  Stack.size = size
  Stack.backgroundColor = color
  Stack.cornerRadius = 8
  if(title != undefined){
  let Title = Stack.addText(title)
  Title.font = Font.boldRoundedSystemFont(8)
  Title.textColor = textcolor
}
  return
}

async function centerStack(stack,body,img=true,font){
  let centerStack = stack.addStack()
  centerStack.addSpacer()
  if(img){
  let view = centerStack.addImage(body)
  view.imageSize = iconSize
}else{
  let view = centerStack.addText(body)
  view.font = font
  view.textColor = textcolor
}
centerStack.addSpacer()
return
}


function formatExpRemainTime(timeRemain) {
    let processTimeTmp = parseInt(timeRemain / 60)

    let hour = parseInt(processTimeTmp/60)
    let minute = parseInt(processTimeTmp%60)
    let second = parseInt(timeRemain%60)

    return [hour.toString().padStart(2,'0'), minute.toString().padStart(2,'0'), second.toString().padStart(2,'0')]
}

async function generateAlert(message, options) {
  let alert = new Alert();
  alert.message = message;

  for (const option of options) {
    alert.addAction(option);
  }

  let response = await alert.presentAlert();
  return response;
}

async function getImage(url){
  var req = new Request(url)
  var img = await req.loadImage()
  return img
}

async function getJson(url){
  var req = new Request(url)
  var data = await req.loadJSON()
  return data
}

async function alert(){
  let alert = new Alert()
  alert.title = "米游社登陆"
  alert.message = "请输入米游社Cookie"
  alert.addTextField("米游社Cookie")
  alert.addAction("验证")
  const HoYologo = await alert.present()
  const Cookie = alert.textFieldValue(0)

  const req = new Request(API.ID)
  req.method = "GET"
  req.headers = {
    "Cookie": Cookie,
  }
  
  const HoYoLab = await req.loadJSON()
  let n = new Notification()
  n.title = "米游社Cookie"
  n.sound = "event"
if(HoYoLab.message == "OK"){
  iCloud.writeString(CookiePath, Cookie)
n.body = "已保存在iCloud文件夹。"

  }else{
    n.body = "Cookie输入错误"}
    await n.schedule()
}
  
async function getInfo(){
var url = API.ID
let query = url.split("?")[1]
  let req = new Request(url)
  req.method = "GET"
  req.headers = {
    ...HEADERS,
    "Cookie": iCloud.readString(CookiePath),
    "DS": await getDS(query),
  };

  let data = await req.loadJSON()
  let userinfo = data.data.list[0]
  return [userinfo.game_uid,userinfo.region,userinfo.region_name,userinfo.nickname,userinfo.level]
}

async function getDaily(){
   let info = await getInfo()
  let query = `role_id=${info[0]}&server=${info[1]}`
  var url = `${API.DAILY}?${query}`
  var time_ = Date.now()/1000 | 0
  var random_ = randomString(6)
  var check = md5("salt=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs&t="+time_+"&r="+random_+"&b=&q="+query)
  var ds = time_+","+random_+","+check
  let req = new Request(url)
req.method = "GET"
  req.headers = {
    ...HEADERS,
    "Cookie": iCloud.readString(CookiePath),
    "DS": ds
  }

  let data = await req.loadJSON()
  return data.data
}

async function getSign(){
  let info = await getInfo()
  let query = `act_id=e202009291139501&region=${info[1]}&uid=${info[0]}`
  var url = (`${API.SIGNINFO}?${query}`)
  let req = new Request(url)
      req.method = "GET"
      req.headers = {
    ...HEADERS,
    "Cookie": iCloud.readString(CookiePath),
    "DS": await getDS(query)
}
  let data = await req.loadJSON()
  return data.data
}

async function getGift(){
  let info = await getInfo()
  let url = `${API.SIGNGIFT}?act_id=e202009291139501&region=${info[1]}&uid=${info[0]}`
 let req = new Request(url)
     req.method = "GET"
     req.headers = {
    "Cookie": iCloud.readString(CookiePath),
  };

  let data = await req.loadJSON()
  return data.data
  log(data)
}


async function postSign(){
  var info = await getInfo()
  var body = {
      "act_id":"e202009291139501",
      "uid":info[0],
      "region":info[1]
}
  let url = API.SIGNIN
  const req = new Request(url)
  req.method = "POST"
  req.headers = {
  ...SIGN_HEADERS,
"Cookie": iCloud.readString(CookiePath)
}
  req.body = JSON.stringify(body)
let data  = await req.loadJSON()
return data
}

async function getCookies(){
const webView = new WebView()
webView.loadURL('https://m.bbs.mihoyo.com/ys/#/home/0')
let data = []
const tm = new Timer()
tm.timeInterval = 1000
tm.repeats = true
tm.schedule(async () => {
  const req = new Request("https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn")
  
  const res = await req.loadJSON()
  const cookies = req.response.cookies
    tm.invalidate()
    data = cookies
      return
})

await webView.present(true)
tm.invalidate()
let cookie = ""
for(var i=0;i<data.length;i++){
  cookie += `${data[i].name}=${data[i].value};`
}
return cookie
}
  

async function getClock(resinTime) {
  if (resinTime == 0) {
    return "树脂已满"
  }
  let timeNow = Date.now()
  let now = new Date(timeNow)
  let hoursNow = now.getHours()
  let minutesNow = now.getMinutes() * 60 * 1000
  let secondsNow = now.getSeconds() * 1000
  let timeRecovery = new Date(timeNow + resinTime * 1000)

  let tillTommorow = (24 - hoursNow) * 3600 * 1000
  let tommorow = timeNow + tillTommorow - minutesNow - secondsNow

  let str = ""
  if (timeRecovery < tommorow) {
    str = ""
  } else {
    str = "明日"
  }

  return str + timeRecovery.getHours() + "点" + timeRecovery.getMinutes() + "分"
}

// ds
async function getDS(query,body){
  let n = "xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs"
  let i = Date.now()/1000 | 0
  let r = randomString(6)
  let q = query
  let c = md5(`salt=${n}&t=${i}&r=${r}&b=${body}&q=${q}`)
  return `${i},${r},${c}`
}
async function getDS2(){
  let n = "9nQiU3AV0rJSIBWgdynfoGMGKaklfbM7"
  let i = Date.now()/1000 | 0
  let r = randomString(6)
  let c = md5(`salt=${n}&t=${i}&r=${r}`)
  return `${i},${r},${c}`
}



if(config.widgetFamily == "small"){
let widget = await smallWidget()
Script.setWidget(widget)
}
if(config.widgetFamily == "medium"){
  let widget = await mediumWidget()
  Script.setWidget(widget)
}
if(config.widgetFamily == "large"){
  let widget = await largeWidget()
  Script.setWidget(widget)
}
if(config.widgetFamily === "extraLarge"){
  let widget = await mediumWidget()
  Script.setWidget(widget)
}
Script.complete()

// GUID
function guid() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
		.replace( /[xy]/g, el => {
			const r = Math.random() * 16 | 0;
			const v = el == "x" ? r : ( r & 0x3 | 0x8 );
			return v.toString( 16 );
		} );
}

function  getRect(size,height,total,text){
  let current = size.height/total*height
let drawing = new DrawContext()
drawing.size = size
drawing.opaque = false
drawing.respectScreenScale = true

let rect = new Rect(0,size.height - current,size.width,current)
drawing.setFillColor(label3)
drawing.fillRect(rect)
drawing.setTextAlignedCenter()
drawing.setFont(Font.boldRoundedSystemFont(14))
drawing.setTextColor(label1)
drawing.drawTextInRect(`${text}`, rect)
return drawing.getImage()
}

// RANDOM
function randomString(length){
	const characterSet= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	const characterLen= characterSet.length
	let result= ""
	for(let i = 0;i<length;i++){
		const randNum= Math.floor(Math.random()*characterLen )
		result += characterSet.charAt(randNum);
	}
	return result;
}


// MD5
function md5(str) {
  function d(n, t) {
    var r = (65535 & n) + (65535 & t)
    return (((n >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r)
  }

  function f(n, t, r, e, o, u) {
    return d(((c = d(d(t, n), d(e, u))) << (f = o)) | (c >>> (32 - f)), r)
    var c, f
  }

  function l(n, t, r, e, o, u, c) {
    return f((t & r) | (~t & e), n, t, o, u, c)
  }

  function v(n, t, r, e, o, u, c) {
    return f((t & e) | (r & ~e), n, t, o, u, c)
  }

  function g(n, t, r, e, o, u, c) {
    return f(t ^ r ^ e, n, t, o, u, c)
  }

  function m(n, t, r, e, o, u, c) {
    return f(r ^ (t | ~e), n, t, o, u, c)
  }

  function i(n, t) {
    var r, e, o, u
    ;(n[t >> 5] |= 128 << t % 32), (n[14 + (((t + 64) >>> 9) << 4)] = t)
    for (
      var c = 1732584193,
        f = -271733879,
        i = -1732584194,
        a = 271733878,
        h = 0;
      h < n.length;
      h += 16
    )
      (c = l((r = c), (e = f), (o = i), (u = a), n[h], 7, -680876936)),
        (a = l(a, c, f, i, n[h + 1], 12, -389564586)),
        (i = l(i, a, c, f, n[h + 2], 17, 606105819)),
        (f = l(f, i, a, c, n[h + 3], 22, -1044525330)),
        (c = l(c, f, i, a, n[h + 4], 7, -176418897)),
        (a = l(a, c, f, i, n[h + 5], 12, 1200080426)),
        (i = l(i, a, c, f, n[h + 6], 17, -1473231341)),
        (f = l(f, i, a, c, n[h + 7], 22, -45705983)),
        (c = l(c, f, i, a, n[h + 8], 7, 1770035416)),
        (a = l(a, c, f, i, n[h + 9], 12, -1958414417)),
        (i = l(i, a, c, f, n[h + 10], 17, -42063)),
        (f = l(f, i, a, c, n[h + 11], 22, -1990404162)),
        (c = l(c, f, i, a, n[h + 12], 7, 1804603682)),
        (a = l(a, c, f, i, n[h + 13], 12, -40341101)),
        (i = l(i, a, c, f, n[h + 14], 17, -1502002290)),
        (c = v(
          c,
          (f = l(f, i, a, c, n[h + 15], 22, 1236535329)),
          i,
          a,
          n[h + 1],
          5,
          -165796510
        )),
        (a = v(a, c, f, i, n[h + 6], 9, -1069501632)),
        (i = v(i, a, c, f, n[h + 11], 14, 643717713)),
        (f = v(f, i, a, c, n[h], 20, -373897302)),
        (c = v(c, f, i, a, n[h + 5], 5, -701558691)),
        (a = v(a, c, f, i, n[h + 10], 9, 38016083)),
        (i = v(i, a, c, f, n[h + 15], 14, -660478335)),
        (f = v(f, i, a, c, n[h + 4], 20, -405537848)),
        (c = v(c, f, i, a, n[h + 9], 5, 568446438)),
        (a = v(a, c, f, i, n[h + 14], 9, -1019803690)),
        (i = v(i, a, c, f, n[h + 3], 14, -187363961)),
        (f = v(f, i, a, c, n[h + 8], 20, 1163531501)),
        (c = v(c, f, i, a, n[h + 13], 5, -1444681467)),
        (a = v(a, c, f, i, n[h + 2], 9, -51403784)),
        (i = v(i, a, c, f, n[h + 7], 14, 1735328473)),
        (c = g(
          c,
          (f = v(f, i, a, c, n[h + 12], 20, -1926607734)),
          i,
          a,
          n[h + 5],
          4,
          -378558
        )),
        (a = g(a, c, f, i, n[h + 8], 11, -2022574463)),
        (i = g(i, a, c, f, n[h + 11], 16, 1839030562)),
        (f = g(f, i, a, c, n[h + 14], 23, -35309556)),
        (c = g(c, f, i, a, n[h + 1], 4, -1530992060)),
        (a = g(a, c, f, i, n[h + 4], 11, 1272893353)),
        (i = g(i, a, c, f, n[h + 7], 16, -155497632)),
        (f = g(f, i, a, c, n[h + 10], 23, -1094730640)),
        (c = g(c, f, i, a, n[h + 13], 4, 681279174)),
        (a = g(a, c, f, i, n[h], 11, -358537222)),
        (i = g(i, a, c, f, n[h + 3], 16, -722521979)),
        (f = g(f, i, a, c, n[h + 6], 23, 76029189)),
        (c = g(c, f, i, a, n[h + 9], 4, -640364487)),
        (a = g(a, c, f, i, n[h + 12], 11, -421815835)),
        (i = g(i, a, c, f, n[h + 15], 16, 530742520)),
        (c = m(
          c,
          (f = g(f, i, a, c, n[h + 2], 23, -995338651)),
          i,
          a,
          n[h],
          6,
          -198630844
        )),
        (a = m(a, c, f, i, n[h + 7], 10, 1126891415)),
        (i = m(i, a, c, f, n[h + 14], 15, -1416354905)),
        (f = m(f, i, a, c, n[h + 5], 21, -57434055)),
        (c = m(c, f, i, a, n[h + 12], 6, 1700485571)),
        (a = m(a, c, f, i, n[h + 3], 10, -1894986606)),
        (i = m(i, a, c, f, n[h + 10], 15, -1051523)),
        (f = m(f, i, a, c, n[h + 1], 21, -2054922799)),
        (c = m(c, f, i, a, n[h + 8], 6, 1873313359)),
        (a = m(a, c, f, i, n[h + 15], 10, -30611744)),
        (i = m(i, a, c, f, n[h + 6], 15, -1560198380)),
        (f = m(f, i, a, c, n[h + 13], 21, 1309151649)),
        (c = m(c, f, i, a, n[h + 4], 6, -145523070)),
        (a = m(a, c, f, i, n[h + 11], 10, -1120210379)),
        (i = m(i, a, c, f, n[h + 2], 15, 718787259)),
        (f = m(f, i, a, c, n[h + 9], 21, -343485551)),
        (c = d(c, r)),
        (f = d(f, e)),
        (i = d(i, o)),
        (a = d(a, u))
    return [c, f, i, a]
  }

  function a(n) {
    for (var t = '', r = 32 * n.length, e = 0; e < r; e += 8)
      t += String.fromCharCode((n[e >> 5] >>> e % 32) & 255)
    return t
  }

  function h(n) {
    var t = []
    for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1)
      t[e] = 0
    for (var r = 8 * n.length, e = 0; e < r; e += 8)
      t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32
    return t
  }

  function e(n) {
    for (var t, r = '0123456789abcdef', e = '', o = 0; o < n.length; o += 1)
      (t = n.charCodeAt(o)),
        (e += r.charAt((t >>> 4) & 15) + r.charAt(15 & t))
    return e
  }

  function r(n) {
    return unescape(encodeURIComponent(n))
  }

  function o(n) {
    return a(i(h((t = r(n))), 8 * t.length))
    var t
  }

  function u(n, t) {
    return (function (n, t) {
      var r,
        e,
        o = h(n),
        u = [],
        c = []
      for (
        u[15] = c[15] = void 0,
          16 < o.length && (o = i(o, 8 * n.length)),
          r = 0;
        r < 16;
        r += 1
      )
        (u[r] = 909522486 ^ o[r]), (c[r] = 1549556828 ^ o[r])
      return (
        (e = i(u.concat(h(t)), 512 + 8 * t.length)), a(i(c.concat(e), 640))
      )
    })(r(n), r(t))
  }

  function t(n, t, r) {
    return t ? (r ? u(t, n) : e(u(t, n))) : r ? o(n) : e(o(n))
  }

  return t(str)
}

async function loadResinIcon() {
    // Base64 img
    const url = "data:image/png;base64,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"

    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}

async function loadCoinIcon() {
    const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAaPklEQVR4nO2ceZRddZXvP2e883zr1jwkqaRCKoQQxhAI4APCIMMCBYVe4PSe9sLmoU99gnYDLvUhKK0NttpPUVoFmgZJwqCIECCBhASIZK4hc423bt15OPN5f9xKDGqv9A1gu9bLd62z6ta5p+45+3P2b//2b+9zS3Bdl+P6jyX+V1/AX7uOAzqKjgM6io4DOoqOAzqKjgM6io4DOoqOAzqKjgM6io4DOoqOAzqK5EYOFgSBHz346Dv2uYDoOPh8KqKiUiyVQBDwyCqSJKLpGpLk4jgyxWIZw9QREQlGwvNj0eCJwYC/LxwInqAqiuzxeguu4/TUNK2aK5QOZLJT+/L5yuZcrro5V8rnBdshFgpjCTaqIiNKHiRFRtNNsA0AHEHAMExMy0UQ/tSG737jCzSy/mwIUKMSBAHHcahUa9i2SDQcWNbePuuK7s7Oi1qbk4tDwRCyIr3jb1wHcF1s28V2LfSKTrZQmto/PrF2cOfQc3uGD65Ol3ITyXiEYND7vg+B9w2QIAiUK1XKlQrtbckPze/r+9S82T0rgsHAHw5yoFa1MXQd27bRDQPDMBAEAdd1EUXwenw0pxJN3d1tVy9dvPDq0dHJe97esfPRt7bu+NHkVHZzIhlHFMB5n+x4zwEJgoBp2UyX8jQ1Rc9ZdtYpdy+c33uWKNY9xbHBNG0EAWRZwuuV8Hj8QH2/YRiAi+uCZTnUajVGx4rYtoM/4KW5LRW5qrfz00vPOPnT6ze+/eCG32+/rVzV07GgF+HPjal3qfcUkCiKVKo1TNPitEULv7d06eJbfL668ZZRj1eKCh6pDkvXbCYnp8hmM1QqFQzDwrIsBMFFVb2EQiGam5tpa2vHcWzy+QIHDowhyTLNzUmuuuyCT/T1zr5s1XNrPrvvwMHHY5Ewkqq+lya9d4BEUaRQLCEgNF964fJVJ/bPPwPAMmdONHPdtuUwNDjMroEBDh4cw7IsHMfBsixM08Q0dWo1g2q1SrVaQVFU5s7tZcmSJZx44iJSqSam0hlGRybIeD3M6ulsvuWT1//76l+/cM/vXt34v6OxKJIoUL8d717vCSBRECkWS3gCgb5LL1j+287Oti4AU697DAJYpsXGjW+ydes2DMMgmUxy8skn0dTUTDAYPBzQTdPEMExqNY1MJsOOHTvYtm0bGza8TjAYZMWKi1ixYgXhSICJiTR79u6nubmZj3z4g1+KxeOdK3/zwvWSLKGqPlz33UemhgE5fzRFCqJAoVQm5Pf2Xr7ivFeTyUQCwLJA8dSP2bFjF1u37KRarbJwYT8LTlhILBGsv+mCaYLjuIdjSD0+gSDCBRecTT6vs3//Pp577jf8+Mc/5rfPPcfNn/0sJ520iImJScbHJ6hVq6y48KyPKooYeOjfn7nS4xMI+b04zrvzpIYB+ZT6WHEFkASBYrmCLEuxiy867+VDcFy3bqBpmLzwwsscODBCf38/p522BNUj4dpQLZvYto0L2LaN4zg4Tj04u65dB4WAKAtIksKCBX2ctLiPa665ivsfeIAvf/nL3HTjTVx99dV4FZX0dAZ7v80Hlp95Ra2mP/zo6t9e75FcVEVpKO9514AOSUTANG1cy+ED5y59qrOrva1c1lAUGY9HplyusHrVrzEMjYsvvoiu7jYcC8olDdd1qF+z+GcuXkAUJWzbwHUFHFOgVKowPT2NqijMntXNd797Lw//8nF+9M8/YN++fdx6y/+kOZUiPTXFwYMTXHbRuR8dm5weXLP21TvbU8l3FY0aBpQuFIH6UCvki5x/1infWbiwb5llOjiOg0eVyedKPPXUs0iSzOWXX04iGUGr1YNwHYiL64q4roNhGFiWhaZpaFoV2657UTDgJxgKYVs2kigiCgKWqTM4tJd4PMr1N3yI3rlzuO3Lt1Mul7n9K7cTT8SYnsqSnlK47ooVd+wbGXnxwOjYK8lEHMc5tnjUcCIqIiAJIpVKjeZE7Mzzzz398wCyIhIO+9E0ndWrn0KWZS6+eAWJZIRKWUfXdRwHBEFCEBQsy6FUKpHNZpFlEVVVCQQChEIhPB6V8ck009M5LNtAEkESXURRRFUU8rkie/eMcvrpJ3Pfffexdu0r3HvPvUQjMULhEOlMBo9H5kOXXvCIKCOXtQo2No5rvf+AZFlCEAQkEZadfsoPZVl9RyB8ee3LGIbOucuXE40GKRVrmKaJIEi4rkuhUGRsbJRsNo0kSSSTcVSPB1VR8fuDBINBIpEIsWgU0zQoFctUSlX0monrCkiyiKJK2LbNnt2jnLT4BO64406eWrmSn/7fn9DSlEKRVXbvH6F/3py25YtP/vvsdAFsF8dufLA1DMixTfLFPK1N0fPm9/WclEkXmM7kANi2bSfDg3tZuvQskk0JisVyPRC7AoVCgWw2h+MY+HweIpEIPp8PUZSp1XQsxz6cC9m2TTQaIhYLEwgGkVQFVxQxDINKuYwkijOpARzYP8GFF53PDTfdxD//6AesXbuW9vZ2SqUCU7kSy8449UuxkD9m2C6y0ngS2TggQcB1oX9B35dUVcEwNVRFZeTgBBte28Sc2XPp6urCMHRM06RYKGFZFk1NCZqaYsTjccLhKCBSrVbRNA3bsgj6/bS2JpBlmXq4EGfg2ni8MoGAh1gsRiwcZ3JyiuHdQzMZt0pNM7j00ktIROPcdedd7Nm9m7bWDvbt308o5PMunj/vE5VCGeEY4lDDQVo3TBKx8OyuttZLyqUKoiShejzs3LQJ2zFZ0N+HJEkUCgVc18XrVxkcHGTHjp184Pzz6ezqxO8HQfDjODMpgQL7hg/y+OMvc8WVV9DZ1XQ4A7cscyaBdBgeGOKFNWvomdVNe3sru3fvxePxEAwGCQb9/MPX7mTb25vZvPkNOrvmACK1mk1vT89H/+7mj993y61fbXiMNQyoOJ1n3sknfiQWCVMoVvAF/GQyGabSaebPn080GqNarZLJZEilmkilEkxOjHNw5CAPPfQLAsEgwWAAv9+H6lFRFBlZFnl69TO8/fYWpnNZTly4gOx0AccFQzcoFPNUKmVsw0aWobe3h/7+xQwODlKtlgj6/OBKLFq0mFNPPZ1tW7eyd+8etKqOKip0d3ae8tU77106np5+rVF7hUaSqJlMV9j0+pYNixb1nZ6emiYUDrH5rd8zODjIihUriMVilMtlxsfHaWlpIxj0EwwGkGTYsX2Q4eG95HI5ajUNx3HQdI1KuUIsGqWnZxaT6UmKxSK49eGjejyoqod4PMLcufOYf8IsajWXsbEJVEVGkgSy0zlKhSqaYZDP58nlcsSjEXbvHcaybK677kO8sPbVH/7mldf/9vEHv/P+FszuuOcH7c3J6Km1Sg3V4wWgpaUFANM0yeeLFAoFDMNCVT1oNYNSqYosS3R3z2JB/7zDn+U6YNsgCvVlhWkeuhEgSoAIh8pphgH5QpGBXQfQdB3XsdE0nUq5gmXZDA8PMzAwgKqqtLd3UiyWSCSb2Lx5M7u276KrrfO0xx+8tuFVbMOAuluS54bjUXH7jkGaUyl8qSRNTU309PSgaTV0XScc9tPR0YqieCkWi8iyhOM4FAoF8vlD1ycgCBwujimKis8fpFIuoxs1bNvEsl1sy8axHUzTmolHFoZhoesG1VKFXK7Aprc2sWvXjvrMRn2h2tHRjlfx4vf52LJ1OxdeuGLex/72S7Gf/eCe7PsJSAh4PP0BfwDTNNm6ZRtnLTsDXdPQNAOfT8Xv9xOJhDFNi3w+iyjKuO6RC1HhHYUtx3GQZQVJlhk9uJ9YJIpl2uh6Dcty0XUTQzewTRvTsTENjXKlTLlUw3FcBgcH2bplK/39C+ns7GJ6eppINEwoFCKfz6PpOtPTGWRZCnX1dC8A1jVicKPTvKCoatI0deb2zkbTTMbGxvD6fNi2ST5fYmoqw+joOBMTk1iWheu6h8f8ITCH6j/17NohkYiwauWT3HjjDbyy7hVaWtowdJdyqUqxUCabzTM5NcX42AQHD04wcnCCdDpDPl8AAZqbUzQ1NVGt1nBdl7m9c/H5fJRrNUrFMoVCCdM2iEejcxu0t/EhJsuy7doOqtcDAkxnCnR1dyEIoCgSIOG6AqIIf7wYdRzniJV7Pe3v6Gjlqaee5pFHHmPBwlP52c8fAgTmzzuJsbH9VKplqloNSzexDAvTrg8117YxTYNIJI6LyNjICKmWVgC8Xi+Tk5O4jothGLiKQrVcQVHkVqChONS4Byn4ccGxXCxTx7QMJFFEEEREUUAQJERRPMJznBmPMQ4vTC3bxLIcEokU69Zt5L77HuDiFZfxldv/nu7uuXzv/u+y6c3XcRyRqaksxVyFSkmnqmlYRr3Abzkutu0gCiIeVaWqVSmVSrS3tx3OwzStRqlURFU9lIslBBf/DKD/tBrOpE3LmWs79VW4aRpIUh2O64o4joDr1j3Edd3DCZ5hGOi6iW4Y1Go6xXwFXJnNm7fw9W98jbOWns1FF6wgn8uw4qJLaGnp5oknH2F6eoJAIILgWriCVYcNM/CdmRW6QyAQpFbTCASCzJnTy/j4OIIgMDi0E3BQFAXdqOJKYk+j9jYMqFCu5cvVGjWtSrVmoGsmjutgWSaWbWNZDpZpousW1WqNcqVCuVQhnyuTSecYG02Tz1YYGtrNfffdw6zu2dxww/Vs2rSJV15aj9/r5fxzz8PQbV5c8xyOq6N4PNi2ie042HYdzB+CvYCiqLiuwOLFJ6HrVYrFAooiUy6ViUTidc+1HRzbrtCgBzU8i+Wnsxuns4VL6jOMzsjoOKVijXK5jICAblq4toPj1JcJ9V6XiamZVLUahmEhCSJPP/sksqJy08c+xZatO5hITxPwBhjYOUSqJcGZp53Fa6+vY9PGdZyy5Ky6l9r1uCUIApIkIooiXq8HQXDp65tLMBhgaGiAcDhCJBKhJdVKrlBEklRwQa/qYw3a2zAgN58vTuWn89i2gEf1MDQ0xOTYKfUuqK5RrWrohgGCiGtaGIZBTTcxdQPTtFE8Cq9vXMvExBif+ORnmJrKkpkuUKnlGR7eSlfHbCRFpnv2HEqlElu2v4HX6+eEef2UKhVEUUAUBSSpHut8Pi+qquDxeCiVCvh8foLBIJlMhol0mlAohCzWa97lqjH5fgMinc1NpDNZLMshGo0zldnIS6+8xNJly8jlitQ0Dc00sAwTewaQJMiIihfDMjAdi0g0ygUrLmFsbJyxsTdIJJIMDGzDtizmzTsBCZndw4OkMxnmzu2nva0F13UJBAL4fD50Q8N1HGRZxuPxIEkK0WiEcDiCINSLb1u2bKFSqdLZ1YXj2OiOy1R2eoD3OZN2X3tt7ZoFvfOyCk7cESRaWtp48aU1FEolemfPRZBFXNPB1A2qNR1RVChpBaazw3S1diNLAebNXoCoCOzbt498fprx8f1EAgnOXn42gUCIN9/cyPoN6+jsnMW5y8/Dsm1qNQNNq7Bnzy56Z8/D6w9Qq1Xwej2YpkaxWMCregi3B3nyySfZvPn3nHTSElwHoqEwru2Utmx9Y0eD9jYO6M31L1SuvPzK9WGv97JSuUYy0UQkHOXtNzczOjJCLJEkGo4SDARRFS/54jTbt/2eSrVCIVvgxP5FCPixLZeO9g7K5RKCI3HyKUuIx5t46603WL9hLalUO9d++Lp6R7VYRBRdXn99HUNDg0xMjnPxikvp6uggXyyQTk+xd+8BRkcnUVWJAwcPMH/+CcRiESbHx+lpTVFx3DfWPvt4ngY9qNFZzAWcscmJ50qlGplMhlwuh98fYPGSJfTOmcv46BgDgzsZ3jPIZHqUN9/YQCKe4rJLr8Z2bF5dv4aKViAzPcnw7iGakilOXLiQzvZ2duzYyrpXXySZTHHN1dcwMLCD0dFxBNdh1arHcV2Rj9/4aUqlCr9a+RiO4DI4OES5UqWvrx/Fo6LMLFZb29owTQtZVUmmmhjPZF6g/oxDQ4COpdwhXXDpdd1LlyzePZmeRhQVJLHeEf3AuecznSswOn6Qffv3UCqUOOPU0+idN4/xiTSCoLJr59tkMpOYpkbv3D76FyxGkhWyU5M885tV+P0hPv6xT5JMxvjpT39KvpBHcBxCoSjXfuTDtLW0smffCM/+ejVVrYJtOrS3dRMI+mltbcYwdUZHJoiE63WpYNBPz+we/eGVK/uffuzB/YDViM3H8niN+7tn/228Yuo/jwX91KpVJFmhVCyza9cATc0pRFGho72Hrs4uAqEww8O72bp1G6VSnpOXnEos1sQpp5zOhRdeTLFUolypYdgm3V2zufbajxIMBjl4cIzrrrueVKqZWKyJT3zqvxMKR9i9bx/zT5jNsmVno2kWnR1dRGMxFFXGsi3GRseIhSP4PCoer0JvdzvpanXl0489OMYxPCVzTAUzQPlvH7x27rLFp2wbHx3HEQRkSaZarXDxJRdTKlYYHt6N16vw9tu/x+vz09XVheM4RKJxuro6ScVjDO/Zh2mZ+P1evB4fqVQTgiQwlZlCkRRaW1rquY6q4A16KVdqKLLMG29u5JWXX6WnezbNyQTThSxtbe3kC1kc0yYWi2PqOh6fj46udh55/oUzH33gW5sBE3DfVw/6yKdudQH7hacf25evVf4lmYhjmhaCKIAAb23aSO/sbqLREPlCidlzenEdhwMH9lOpVBkZGWHbtu1s2LiJbD6HKEr1ljMO5XKJQqGAz+vD7/GQTqfJ53PsGznAhg2vs/H1jfziF7/k188+T1OqhXgiSiY/TaophSxL+LxekqlWbNtBt0y62psZzRVWP/rAt7YB9mfu+t77X5M2621zB7AeevD7t/3dzV++JhjwJao1jVAowsh4mpfXreWc5eew5sWXKZXK9M1fyPDuAcBh/rw+apqO7dZX5NmpNJph4Dg2oihguw6SJBHw+fH56rUlSZWJx+KMjmxl+/adnH322YTDQbK5LE2pZlpb2hAEG5/PQ6VcxcKhq6sFxasYj/7kkVuB+kJOaLxx2DAg25a56sYvuCv/9dtWITet7Tkw8vn5XR0P7RsZQ9cN4vEkO3cO4OJy3vlns379G0yMTxKPxQmFggRDQWRFplypoKg+PFGVQDCAaRhomobH5yWZSKCIIjVdp1ws0d7WwhlnLuHkk/up1TQs06BYyNPa3EJLayvRiJ9SqUQ1V8V1HJKxEIsX9vPLZ1+85ZVnfpUGrM/c9R33WJr0x/D4y+G74ADmw//6vZWf+9yda1ubkueMpNOoyDSnmtm5YxDbtjjv/HMZHRnj+efXsH//fgYGdmGaBiChqp56rbqni0suWUEoGMLr87HmxRfZum0rsqyQnZ4m4Pexfv16EokYul4jGArS0dZJOBykpTlKrValUCzjVT04qs15Z57KW8MHn/vm7bc8Qj3uOIppNE6HY2kcehQcj8IHP/VFF7ABc+3WzTe7imClomE0XUeQBDo62tk9tJ+nVz9DUyrO1VdfSUtLC7pmkUp10tc3j+7uDpJNSbZv28aTT66kVKnwzDPP8PgTT6AbJvFEgkWLFtHT1Uk+k2XXzmE6u2fTM2sWLa1NLOifQygcRNNMkskkwVCAc85YTFrTRv/XbV+4aQaOdfNd97iOIuH80RO1/xk1PItdc/NX37Hvie9/XQa8513zsbPO6J33jF2rycWaht/vx+vxUSjkMS2Dk5ecRHt7K9WqwVR6msn0BLphosoShqkzODh4+LGY3jlzSCYTmIaBJCsEAgGCwRAer5dg0E9ba5y5c+dQqdSYzuQBh0qpREdbM1Xbnv78N//PBc8//NAQoH/67n+yhCNM/OFtt7y/bR9B+JMPtwHjpSd+tsG98m+uOufEhb/yB7xqrqTh4NDZ1YEgiBw4MEImM0UsFiOeiJFqiVOtVKlVagiSQGdXJ+nJSaKxKH6fD8swEMQQiuIhGovh83tIJMLM6u6ko7MNgMmtQ3i8XrwehbldrQyMT459/f4Hrnj+4Yd2AwZgH0u7+R32Nu5BX/mT/U98/xsioAKeZVd89MQzTph/RyoSvaBUquIiEI5GCAfCIEA2l0EUobm5GVVRsC0T27WxLBNZVhBFCQEBVa17TjQaQVFkOjpa6Oxqf8d5y+Ua2XSWSNDDhoHhtV//zj/+j3WrHhsDdMD4zDe/+yfG/fD2WxvyoPfkQfUPffarDvU7pr+6+pEt933rjusGRg9+MRAOFpuiEUxdJ1fM4WLT1tpCW2u9uF7VatQMDdMwcCwLTathmTqKIhIKBUmlkjQ1xQkG/age38zZ/mBcMOjDtG1+/sya+y9evvSqdaseG6UOx/z0n4FzLHpPPEgQBEzTYtWP7hYBZWaTl194edeypcu/lIiEblBnyqOiR0b2eFElCVkWkSUFr0fFM9OnB5BlEY/Hg6J4EcV6Y1ESJfr7+1C99WPKpRKvvfX2K4/95nd3/+TuuzZQD8gGYH32W99zTNv9s7XVRj3oPQXkurD6X+4WqHeMD4O67Oob+xfMn/fxWDh8XTgY8EfCYRRRwHYtXKR6y0iWkRUFURQRRQmPR8bnCxCNxkjGwgR9PgLhAFOFPJu2bV/z0rpNP/vOP3zxaWZm0pnN+ty373dN2+GvFpCiqjzxwNcE6sP3ECgZkJauuLJj8fwTz2tuip3TFI0uC4eCrV6fit+j4vN4URQVWVbx+VQikRD+QBBBVKjVdEZz+e3bdg+tefXVdase+qd732Immz8EBnBuvff7riA4/NUDwtJRsXnkh98+BEo+YhMBYd6CRYFTTz+7L9YUnxOLJ+Y1xeK9yXik1+/zJwRJShuwNZvNDY6mJ/fuHhoeevgH/zjITD1qBsihzb7t/p+6rgOaUeW/HNAx6kiPko54Lc68Jxxx3CG5/CEiOzObfcR2aF/D+qv5vtgROpR1H7r7h4Ad2gTeCeuQpxz66fzR73+x/8jylwJ0SEd6hc0fgBzNg458/RdVQ0Ps/0cd/1LvUXQc0FF0HNBRdBzQUXQc0FF0HNBRdBzQUXQc0FH0/wChXA7mTToT1QAAAABJRU5ErkJgglwoMbu9hb6+bu753vdv//InP/4YYAOeN8MFCydqxl3s7X/9iV97/Udf/JQEqIB2w/tu+eczOlpuLhar1CyHVDJJNKqiqVHy+TyB4NLe3kpdXR2pZBrDsigWS9TKFWzHRpQkDh06hONY9Pb2IgphXUnVNFQtQjyeQlJEohGFtpYsc+Z2k802MTGR5+DQCHX19VimSSoqoiWSfO1H//b3n/jQTf8KmIB942c+/2uB4f1//9E/+M0sPqHjEx65b+1t7/jAx4oL27IfS3uCUChXkWURLQods9qRRZlCqcjk5AGyzU1kM1ka61MkYxEQwCdgVmc7kizhuA6+5yMKArKikE6nSMTjxOMqPb2zaGhoPH4CTY31VCo6lqnT3tpAxbS5a93DH/78bR9ZB1iA89471v6n1wH/XveLvf3DnwwIu5oNWA9/9XP/9MSGF1eZuD9vbc2iSiK1Sg1DN/ADj2w2Q19fH4qiMjWVZ2oqR6laolwpUS5OMTV5lKmpcSyjhiwKJBJx2loydLQ309hQR/fs7uNwjtWiRUmgd3YHmUSagcGRg7ff/aWLToBjM8OU4rfp9+piCAJC4PPDL35aAI51NwWQ3vdXt908v6vnNkUU0mVdR5RkUokoqqogSQqKpiBLIoIookxX+lzPB4Lp+zRiJJIpotFoWPd2fVQtwpy53WjafzT8yYkJvvvU+vvW/tOnPzH82qu1aTA24L//s/8SONNVyF/VTLrYKQHkmDaPff1OgdAi5WlIylmrL2v+k/MufH9rY93NUUmJefjIERVF0ZAEkGQQUZAkAU2TiUbDWxLC+zQkZFlFURQkOawa+q5HX88s6prqABifmOD5jduffvy5X3zuwbv/cRNhlGwD7q1f+FfP9wNqlssfBSBRVVElmUfv+Ydj1qRMb9J5a65oXbRs6btb67PXNqYS3Q3pJLIk4x1fLB7+hiiFizNFUURVFGJRjWQySUNDE43pFNGIhoPP4fFxc+OOnf/2y42bvv31Oz/9AmE3PwbH+8hdX/ZlJZwe+qMDFFhVvv/Vu8L5mNCajm0SIF73ng+t7GhtubC1seHCurq6ebGYmo5qGslIJCy8KxEkRSKRiJFMJpAVDdsLKBbLE0Pjk9u279377Ppn//0nT//goaNM54aEA4UL+Ld98RuBaZr8UQOShYCIKPHgvx7vdtIJkKRpeOLyVRfU98zr78q2tPQ1NWTmNTfV9yeTiW5ZkkVfZE9e17dOHB3bP3T40PDW538xtGvLKzrT1c1pIC6h9Xj/8ysPBr4T+uP/FkC/p45ZlMTrwI49Fk7YOGF/Ys34GBSfaSDTm88MK4O/TX8UN/XyemOP3X58IhjxhOfH9vAfoQS/Yf9f8sdH/1WATtSx2OmYZmpB/y3/BDWjLvb/s07/88JJdBrQSXQa0El0GtBJdBrQSfR/AaUzwqHmQgLvAAAAAElFTkSuQmCCHY/f851/evTogb2vl8rMZfsmYP3Jl7/qeZ77M59G/JUAck2Le//+i8IsFJkQkjr7/c+s9VavPTe1eNXqnrb2fF++tWNxa0u2pyWb7o1FI1lRViqW5x6YqdWGRk+OHD8+Onz8mQfvPTp24pj9M243Vytas82+7c6v+a7r8SsB9HPYnDepvOJNEvPYf3qDNifmucyCIfSgeT+Q8asGBCEMgdCDVEJIc9PubD2nfzqYuQzZmf3dz/W0yq/jsfA5MdzhlZggE0Kam3ZzMernoT933znZxZltcxLGL+WTon4ZHvRTt+AVKDLhlJv7Ovfa6bBOP3ExB2VOQ/YIgZzSdfgFwfw6pth/eTtegfWz2pz5r2nead/Pa8tmPvZr/+SF19jpU+R0jzm9nX7ta9uv3M7oQf+/25uf/nIGexPQGez/AiXlW24eIwJFAAAAAElFTkSuQmCCCjWJOKlUDZqm0tDQQHvHCxuhIS8dBpLDh0eJ4iFHJO763Zbvv/8tl3+U0CFbgPOeG74eeJw8Oz4VQH/Wod43ffB6//gEBnY+O/XdW750/aNbt7zOl6U9bbkcMVWlVNYxLAPXs/E8h0QiQXNzM5m6DPFEHC2qIUoiBGG7su24OLaFKHjE4hEa6jPkclnS6QyyrKHrFVw3mAXnxP2+eU11HB7Ll7/5k3s+8v63XP4RQpOyAOeDN37ztA6P/Vka5Js2tu1w73duFAlbWVVAURRVft+HP/GP81vbPywIXsIyHYIgIB6PoEUiiJIctt6JIIkymqoSiagoslI9cBKmF4oioSgasiyH72UV23XJNTWRa8783pzGxsZ44Iktd/7wrrv+9aHbbztW/eJswP3ozd8KTNvD9Hz+WzXouLzxQ5/2CesaEzAdx7b+71c/e9OP7r7z7KOjE9+QZaGQiGoEBHiBRxD4+K4Lnkfg+dimSblUwjQqVU1zZzcgj29ZW46H4dgokoAUvBA4hkdH+Mk9Dzz0qa9+643vuPL1f/fQ7bcdIdQaC3A/9vV/+7OOHb4sGiRrEVRJJnDK/PRbXzquTQphlJSWn7Oufu269e9oSTe8Lp2sWVmfSiApMr4gIBGGREEIdygCQUCSBCRRJhJRqUnESSbT1KdrSSYSKIpC2bU5PDRU2Nq3697Ht267/Qc33fB09TFOdXgfvfk/PNu20bTw3MfpatDLDpDke/zk374iVOchVUGSq+/FS69864KujnkXtjY0rE+n04sTca1DU1UxGY0SjUaJaJGwcNVUamriRKJRAlHCsFx7ciJ/+MDQyPbdh/s3PXTvLx7Y8shvpqvAuCcM72O33BoErsfLAdBf5Fj4uz7wz4ED3n9968bwYEU4cQmQH/jZj/YC+4H/UFRNvOi1b2hrbm1b0NDYvLA+neyqq00u0DStXhSlGcO1+8aL+p7RY8f6Dx3qP3rf7d8f5AWC3Tvh2R7gXf/tWwMPEdc79dmLP1VeCif9snxOdRzXqhNfhZOM4xL8wfCrw/uD15flDPj/2C8v8PsL9Ph9wE72KvDHoAQnvJ44/qLy3wXQiXLiwo6DBXNrEPw3APKH8qIm9oq88vM4c8orAM0h/w//kMemxDjMSQAAAABJRU5ErkJggp/989/NvusHflYrVZ7zHD755cIUh9to+JWU7/jWP8EA4A/8wT/ylkF/8JX9Xv/Te70OkiSBEB7KgnI/wGrLQcGg4yBAzyoHK5v8c6UIFF2lKQ4PDyuALk1TAkBNhSsLcAJAEARot7vodrsVAMq5HfxUKbw+5mkrYdN3659twD7OiYacT95a2+KcfZz+/KxjbroGaqwt6X4apXHeOTfzTawVZ1P4LR/mys4O4iipaPgvvPgxnByOqBwC14g4uY2L1QrPfex5LFZLFEWJN7zhKWxvb4EZ609KCcHWiWObGKj2c6vISpO0p82mvi/Q7XQgBG/nWfHlo+n8wbe970f/1t/42Q/s/9yPv499x3f/hdc05nGBiuOVl283SuMv/+VfvHZj78ofH/ba7+32WiJptcCFByUllJSQytKyFcAU1FqHVQCo08xdZqhL8pJSYb5Y4vj4uFIay+XSKId2xc+w6e728263i1argyAIjZUhAdgCNHSszWDk5tfr7x/195ulPn7Nlmz2fj1rG+D8SI6bXUyoKKAUg5aF4afU+9gUKrUKQ2vKpHWT/uxnljzX63bBTBvIpBXhpRdfwtHRETBfokCOwPdRaoX5fI4H+/sAY8hlgSfyJ7C9tYU4ScjKwGZ3b5O43A+pFbSsXZAgEGi1Y+zsbO89fu3aH88LOf327/uL//ef/4vfd/LXfub9r2nlcXGK4xUEg7TWldIAwK5e3f1dW8P+lw37ve0kieELQaajpOpUhBNYGjEHlIbUstqXu2q6ZCGb9SmlxGw2x8H+Ee7fv4+joyMURVEBoDX3glWUcas0oigyCsW6AViLKrjX1LzGTddN/24uwnPetpt+e56LUcOEmxQIN9ez+ThnTTp6CrRH5bgn9p6fR86y5yPlOpnM/iml4Ps+OkaJt5IE7aSDF154AQ8ePMBsNkOe54iiCFrrinFK2bspnnnmGVy5cgVJGFXlBs+z+tYUJ8jbYkpDlgpMS3DGUbACPudot1q4cX33TYVWX1uU5eLb3/dj/+jnf/aHRmdc6GtCLkxxTNPVK7IfHwxBFFTv/+6v/IN37+3u/omdneHT/X4Pfkgp1rqUkERsWCf0QBDwSPHOuhRe1emdcAO7qkkpsZgvcO/+Pdy/v4/jo2MopSoANIqitfYA1lSuGKDc4hkaSpWOZcM3TuBNcp4SOevzl1MkrgJ5uazZzeKGo84/p7POsfn+vO1JWQjY0HhTcdjfRFGEwPcxHA7he3Xez507d3B4eIiyLKvw92q1wtHRUVXXdbVa4eaNx9BO4nWF55zfRmXCGDgYpSwAUGUJCYrMiCBAFPi4srXF81J/Zrpc/dGs1Edf963f98/+2s+8f/VatTouTHG8fH7AQ+6HMXznt3w1A4C/9d/86tufuH7126/sbn1+f9ATURiAcY2iJHcEAPnQCgDTYJxBwbQKtG0LTZREal2RuzgXUFpDSoXFYo6Dg0PcfukuTk5OoLVGGAZIkmSNOu55HjqdjnFNEkRRvLH14cvhDJsmTx0VsS7XyyuFTXLWCropv6WekHaiWlem+kW1T3t+Z+ESdn+nwd3TssldqX+vquNqzdeKC1mLxWJOQgj0B30EYVBxaYQQODw8xGq1qgoiT6dTHB0dVXkygnu4ce0q4jg24ViAM14VVTrrfgKEnSmrxGRO168UwiRE0olxpRyItEjfucry37+c9G4D+A9/7Wfez77le157yuM1F1X53v/imxgA/Pwv/sqbrl+/9i1Xdrd/z6Dfj1qtBIHv0UDyGARQ9W4lQI5axzNOioFhvXJU5ddWgJdGmqa4f/8BXnzxRYxOxlBam8hJgjAMzIQBwpCUho2ceF5oLIp1Zbl5Mmz+ftOKt+n1w7gLboUv++eSrDYXIl4vHcg5wJgPzoV5fbrPiaso1xPbHl7Oo4Ovf+66fuud4OzxPc9Du93G448/XhVBfu6553D79m0sFovKQkzTFCcnJ1QPpJRgWuHJJ56ECDyqBIfzqfibz5WhVBIKGqIUiKIQg0EPqS4H88n8d06n49t/+rv/3IO/8jM//OAXfvr97JtfY8rjNaU4fuDPfDMDgJ/8uV947NrVnT+5M+x9Wb/X6be7CYLAN4QeBt+wE6E5pCJKuFIcgDTRFdukZ52VCdR1LBaLBU5OTnD3bm1p2MhJGJJiYIw6oXc6HfT7XXQ6PYRhCMAOZrvv88vY0WsildXb1pl1zabOze3Pm2jNdge2qLDWeq01ZFOBSKnWFJ+1eOoK6uutHy2dftPxm7VBzwJWN10HN6egmN7gHNlM2/X923Ct5dUEQYCdnZ2K/8EYw/3797FYLKraHUVRYDwe49atj6FlQupXrlxB3GpVDN5Hc+WMfaQUiqyAEAJREGCn22X51b0nV+ni98+z/NnP/5I/9A//5T/5R+UvvsaUx2tKcQDAj/yFv9K7cX3vD1/Z6n15r5vsRnGIwOR/2FVaCG7wC5MKL7gJ/xFbEcBaMpi7Ytl6D0dHR7hz5w6xEQ1jkbqPRdWKHUUxWq2kKqLr+/4p7OBRBpzr0tj3m0KuzW02vXcVgv3clvKzdS3OUhyuxcGYnYxuKJamMGOowqG20BAp1fXm2etgpnQUEneO0eByAKbBATZ83vjMuV9u8ygAVRKc53no9/t45plnqiTDO3fuYLFYVOe/WC4xOj7Bhz74IZRFiU//9E/HtZs34Ple5Y6dRbU38DtdJ2wESRseEeEnUArC87G9vc1XefrW6WL1+9/1We/6T//yn/yjD57a6Se5vGYUh7U2ru5dedeVre7/bdjrPNHtJojjcK22pjZYBRjq3BQwMM7BNcAkUJpx605qq3jyPMfh4SHu3buH0WhUAW5E7KqVRpIkVfKVVRquonAniiubJ/q6W3PakjgfF2mKrWlalqQk3XofAE325gpt91u/lmv3RynKI6FJyYzFZiNXCsvlsrJkrPKg7dQpF6a+BhvZ2nQVNPEeJql6E27kWh72PRGzOrh582YVNn/ppZdQFAXCMCRFWhQ4GZ3gI89+BFprpEWOGzdvnJkgR9dTxWEM0dcDJTYYy04x+EwhKwp44Gi1I+zt7rYWy8V7V/P5b/5nX/OnPvb//KX/Mn0tWR0Xpjh8z3/5H50h3/sdX8cA4Md+5m9c29oafvGw139rt9sScezDDwJKWLIp75oK8zjpXwBg2KEC8Bg8BcDpB2IH2WqVYTQ6wf3793FycrJGIbctChljVe2MbreLJEkQBMFGhVBjCw8XKl3/nrTf+QplsxRFgeVyiaIoKlPdFg2yrFY6r3VKeBMQdY+rNa8UhZSAlCW0LpDnZdXGYblcrhUoerlK42fJJqtio7VVXcfmYzStJwAVrmGVh7W8JpOJIfK1MJ9OcXh4iEJK5KqE8ASuXr2KJEnOwDkoy8UC8pbsqDnRjZUGCsXhyRKMe+CcWMZ7V67cnE0mf/CZN7/pPzz5prf+2q2P/KZ6rSiP81k+r6BYy+1R/6zSeOs73smv7u69ezjof+Fg0B/0ul0kJtxZrZ4AhcY4A6+sDRKXCco5g+etd07P8xwnI3JP9vf3kec5giCqzG+bJxFFEXq9ninRH1erN13j6U5o1tR3V++mv79JIZz13Xn7cDEM2+NEaw3f96s8GZtDY/fBWLPMYF3qbx1MpUZIpBhsmLNtws/tSnk+TPTsPNCU4eUVy+n9WfDy9HC27osNt2ZZBsZYpTze9KY34amnnkKv16M8GN+rxtXx4SE+/JGP4EMf+hD29/chpTx17syatwCg1fpz007xIKVMSwyq3s4YQ6fd4TuD/jt2t7e+4kv/8Fe9we7oF3/6/YxB4uP5uyi5MIsjzfJH3uYD3/MtFcnrG7/+Tz2122v/3mEnflO7k/Aw6YALmrTcrM52CbLjzh1HxggBmPWrAY9zlKVCmeWYzSc4OHiA/YP7KIoCvh9WzZDtww8CD+12gnY7QZJEpoeHNAN2PeW8nuDr0Yd6Urhkp9MWSZXCz6ySWL+2Zj6JTUmnSUSckbLMkecCWksDZjKUJVkUFuthjIEpgyicOZ/XLR8BQ61mNXFLKdp3USiUpXaUtD1/CfsItNZVflATC9kIkILXYU5WKx57uvTVpntf78vWRslzGoc2Pf/mzZvkkqQpZTtPZ0CoIE2d0dlojFvPPY9uq412nGBra2vNwlRaQzMGpkX9GdN0PkQVMveVQ2sqw6BUjiAAkiDATm+n9dhw/juzxfz//Kpv/M/v/D/+5l9/ZQhPr7JcmMXxW5E/9rXf6nX7/S/s9rpf0O50OmEYgbMaDH1UIUVQWyCr1Qr7+/s4ODhAlqbwfA8t02vFWiQ2ic26J/a4bobrWSvlaWvhtLl7lnVBjYskKIJAPAb7r2vNuNEQxliV0p9ladXJ3u3C1jTjP54/pbXpcbtCnq8gZd3BLc8zs8KexlLc67V/Lk/CtXQAQDesoEd5zu7vbesF23MXALrdLq5fv46nn34aN27cQJwQC7jVovYTnHMcHR3h+eefx0svvYTZjLKglayTJPEIHKXqOZVEBuz3u7h69erjO1vDL3v8sSe+4J2/7YsEAPzCT/+QWQkf9e9i5OLA0Uec3x/47tra+JzP/W2fdWVr8KWDfvuxVqsDz/Mpvl4Nikfbud1MKaIen5yc4PDw0JCHArSSDuIoMr8hKrNNVLPJanag1wVnTrMMa6kVBgGClniNM7epoxk2nGoRfW4Qfun0YqWkMRdLiaIISgF5vgLn7FRY9mFl07nZCu+Kr5OvKASqsFotUZZ+xfdwQ7hCCAgnBF7fN/de1c+zwmHMZzbV/TxZy49xrqMGehWyLAOACjB97LHHUBQF8jzHfXUXs9mswoOWyyXu3r1bEclsFMaSw5r3B8ZtPgsgllISWK9KBFGA7rDtXTkZvP1kPPm973zX53343/+rf/4SAP0LP/3D7Fu+6wOflHjHhSkOIR7euPnBP/NNlUb4vh/+ycHOzvYXDQeDd7bbncD3PGitUJQlPOZDOIlorIFrbNLA7mDK8xzj8bgqsw+g6v9hH7Tv+6a8Xw+tVrIG+rmrqEuyOl3V204+4kLYcztvAruWAL1HFckAqB6I1qry37XWZmL6DiAaoSjaCMPAXA8dmya4dX+c89twHpusIKaoWohSpDzDMITWGkVRGqWsUBTZ2vkLj8H3fIQigDD4EhMCnp1QJnbONKCVrkOb2nEzzf18WKEM5NNKxN5fW71LCIFer4ebN2+iSDMUKfW8tduUZYnFYoFbt25V2c9PPvkkkiSpnrXLoHWPYe+ZtY5dZSKlhAo5WlEL29vb/b357AsOj0/+1Wd/3nvv/Ma/+fWLAyw+DvmkT3K7eePG27aHvd8xGPSvdJI2fO5R/9FSQZQaYSAgxHoT5fPEJpeVpaq6pNt8hSiifh+WJCSEQLvdQq83WIue2H4odkCQMlmfYOsg4eaoymmMot6WQsw0ua2JbTvV207v1aQ0BCwhAgPmRvB96qxWn6OocmY498F5HVo9T84iaNFrwk1sZrB7/raAMLlIObK0RKpTLCEQ+EFFBYfh4ABUSdxiN1rrOnMWgDbA36O6KpvEPhtbWcxGzPr9Pm4+/hjmywXm8zlOTk4qt09Kiclkgo985CNVlu7NmzerBMc1fMZZwexnpXFNrPWlpUShNZjHEHk+dra2+XI5f+PR/tHveee7ftu/+41/8+svANC/8HM/yr7tu3/0k87quLhw7ENaHN/7HV9fWRvv/5GfGm4N+1/Yb8dv67Qj4QUepJaQhYQCqHSbogiJ79fh0uZ4WUtyM5NxuaSK2Pv7+1V6fGgKCgOoIiitFvE06PN6YjSjG02w0pXm5Gyu4s2ELa01yjJ3eq+mKMsCZSmNO63MAOTwvABxHFZZuFGUnEo9p9WtrDJLCURl1XWa+PXLCmPURxcABKsrqltClbviWgvE8zxI6RvSGdXp1NCV8vOEgO+Eui1mpKErDEFrbYoNNp7nQ531OddiMBp73n4QYLi1hZs3b2I5X1QFf2wFtzzPcXx8DM45ut0ugiDAtWvX1rJ6GWNg5mzXIixYtyI5F+AMyCTgeUA7STDsD5O9ne13H4yn7/60t73z9of+47+XAPTf+JkPsG/7nj/3SaU8Ls5VeTSLgwFg125e/8ydweALOu3Wtu/5VdxdSpNiDUCXCmUpYCeunTT2cHVSWO1Lr1YpDg+pGvl0OgXn3BC8Qlj8waLuSdJeo1K7g2B9wq9fwFmWxVnfN0HONF0iyzIDPBbVKuf7PpKkVVUbs/1k6VxqM9gyJl0AdBM4+bAreIU1cAamKCnwLEDXmuRB4COOAwjRrSanzCWWaYp0uUSaZ0jzHF6RI/TJAtGMkVKivdXa4YxzdTkfD3s97nnbMUXFnsh6unntOrRUmM5n1GkuSyuXVUqJ8XiM5557rgpxWyp78zk3FwT7bIjJCoAzqEKhQIkwCNHvdHFtb+/xw9niiz7/i373v/jQf/z3d+y+ZPDxWeyvllyY4vAewuL409/2tdXd+a7v+0B70I7e3WlFb+m0W0J4ts5jHcLUpYRmAlIrZKsSpS+rpj42ckIl++ueplmW4/h4VLkoSilEYYQwCCE43Q7bptDyHprJZq6vWrsY50dK7G/dz+17i1PkOcX4qdx/DimpdYM1h20jals13bJV7TkopSu3xrI4rTTp0vb4BDw+nNTX7IZCT6fn17gJA+AZE92DEGQptX0PQeQjzks6V6WglUImS0CW4Mw2sXb+Za7y1+5JncIWHuY6XKyhciOKAjwIEHfa2NnbxWOPP47laoUHDx4gSzOEYYgkSbBcLrG/v48XXngB/X4fYRii1+s51hFOjQ/XEiNlVUCBQQuBggFSaIRhhP7WMLo6mbx793jn864+9sQ/uP/SCwqA/sUf/yH2ze//8580VseFKQ75clB4LQwAu3rt+pPdVvtd7U57GMURhOCQpYQuteHoacoD0BLQQKFzlJKh9AQ8rzRAoQfO6xWwKAuMR2M8ePAAh4fHSFcpwjBCkrSqniA27Er1QUN4HrECCS+gE9zskmxWGu4EbX5nFYZVGkVBeSRaS+MqBWt1P/wKD6hBWKskaqtiHbQ9vzjOxy9ngY42GmTvie15Qi4IB+eAEAG6JmpVFGUVvs2yrLovFudRSoEzBsaJO2JxAnsMwpvYmnGy6byaclrZAaWUQFFUhLnHH38cq+USy+USIzmCLiWSJAEApGmKe/fuod1uVwuMTXBsMl9dJWWPTWOCImK51shYDt8XiFstbG1tPbG3Pfw9f+DLv/o3fvHnfuyW3Q/XZxe3vmi5OMUhzy/O+j3fWWEb+Nz3vJfvbA0+a9jvfnq7HQk/8KEUPdjSUMsN/4gmCpyVrwS0kpCCA4zqR3JBlaxXyxX2Dw5x/94DzCZzMCZMinwEy62wqdiEa4SVKXtOQXIAp5VJ06pw6d229oPtRCZlAa0ZhGBoteKqORNlnJLyEoIAWKsgiJMBaG1DshZYPD2hP15g+ixhjEFoDcXXQ5E0MdYn5DqTVkAIQKkcUpagDGNq3en71NHOclGUkiiKEkWRIy9LcK0hfHLVhEd4CKWzUKU2zjkYuEmBt5PTtUKIgLXpVrjnmuc5jS/OMRgMsHf1Kg6OjpAXGebTedWuk6rCzfDiiy9W5RT29vbgCYFS2hq3NXO0yZcBGBgX0AyQWmKJHBH34AU+Ot12fHV7+wuOJtN//YW/78t/+df+57+fA9D/1U/8WfbN3/fJ0Z/lwhRHnj9UOXgGgP3BL/ujj+1t7/yu4dbwRhzTyiQLDSkJaWcgSjmDhnboofUAoOiJGauQknz+0WiMo4NjjMcTKA202x2EYWy2Xadmu1me2qRv6w1l/K00y/nZ83F/W7skVmEQp8P36xCq5QmQdeFVK3BRKMMG1RWHo47obD6+G/lx788rIg64Svu3CWsccPquuOFrxmCumTq2EcBrKe0efF9AKQHfJ4VI3A+gyDnKvECZS5R5CU+QUqXQKFHNyS7UqBWEzbityxPYznF0nhsvChoKuSwhFEU/BoMBrl7dxXIxw3K+BKCr52VLLzz//PNVc61el/Ac68ttwpWqEgVagqsCimvkKMCKEJFxRbeGg+u7J/33vPnTPv3Xfu1//vu3ql3knxR64wLBUX72ob7/u76hGtGf83nv5btb2+8ZDNqf1+22A8/zIaVCqSQkQBWoDZMSSlPhYcZPTQqK5nGyRpTGapnh+HiE8XgKKXVVUo6yJ1XFFrR1QoWgCaG0oqZNTftzgzQnqRvjt9jDYkFovdYacRyj1Yor7oitDWFdDjf9/XQkxz1ynU/iHtOeR1OBfTxy3vZ0LFaFe61SW4vcNEjKnGsACjVhtFyrPUqAdYgkiQgsnqeYzWeYzWbQWhMuFUWIotBUdtNrDA8mLEBeoTGNMbKJ40OWgNISzKQKtJIW9nav4uRohJPjEfI0q7rx5XmO5XKJF154AUEQEB09ihCGAUqT18I5r7KUXZFSghEeC8VB45gDXDAEgUC7HYWdKPqsQZy86wt/9x++82v/+B/kAPBf/6UfZN/4XZ94rOMCFUfwcj9hANjv+X1/aG9na/gFnXbrWhgaP7jMUUoNyXwAHB71D19rubBpVdVmYBZFgcVyjslkhNVqUTV6tqE/Wu2CatUQQkBVCUMGS1HUz7UZPTjrUlzz3VoYRMGuM25tDYsg8NaAUuIX1DU1mngJXWd9HPc0zuJdnDrD85SJsekfTdmQZnUxnU3b1wAxWQNNi8wqWYvlkFXhIYpjU8lNI8syZHlGXfM4gx+GiE27Tc/zAK6NBabNOW2+H5tKO3LGILWGQlmFh/u9PrZ3tnF8fISjg0MqMWgWGqWID3T79m2yPOIYV65drZSgjfJZpvFalIsB0AqKk/OdQ4IzhigIEIUR67Sjp3Z63d/7lk9/22/+2j/+Bx+yT2ejv3XBcmGKI5Ppxs9/8H0VSxSf++4v4Ndu7L69t9V7e5S0QiE84i8UJaAYPFGCawUwDWk1dNW7/bTYVX+xWGA0GmE+n0NKjSQJzOquQH63QByHVXiTMQa4RcgbjZCtrK/uZH66dSzsxF+tMuR5aoDXGElChYzD0AdjHgBZgYj0Z2o8aDK9zxNXmWwCYNfuBwCbQVrjEXWXNBh+h6QfrBVHcqMyVXPrtd1T5XPaxtYgdcmP61EP5kRJqpaW9p7rWmkKIeBzqiEaJRH8UJjyB2PMl0ukaWomcV2djXgh2gCxAm5haLqvrHJl6Dx4dS8ADc4oMVArDeEJRHGEra0tbO/sYDaZIl2l4IIib3ZhmM/n+NjHPoZOu4243UavR60aCL8SsGF+i29Qqr2EYAqF5kDpg9pFlPC8AFEQo98dtAaD6dv60/lbrt988sN3b9/SAPA3f/YH2Hd+/09+Qq2OC1MchczO+5oBYO/9XV+yPdzpfV6rkzzuRRHZFBqGggz40NCQ0GDVGNukMtyJVBQFJpMJTk5OkGUZOAfC0Ifn2eI/GkHgVbjG2ikpN7xWf9O0bmofXlUWgyVswWxrm0uTwgiryShltlaFi1YmN829pqlv5DGcs/pssj5Y9S8qWreCqRFqnwTWLRL3esl9s9mtzWOTe2APa4v/nEcTJzxA283tp7A1LrTWKFSJUikIj4MLgTCK0O62wDjDfD7HcrnEZDrFeDpGGERr1chsAaNa+dlz5OZ6msqXGc5IbfEwxjAYDLC7u4ujw0OslquKkBaGITqdDhaLBR48eIB+v4/h1hYCz0O724ICq3hHjJGNrDTMuFaQXBr6voIuORQkwlIi8QL0el30Bt2d6MHBY5/52b8tvnv71tI+TrnB/blIuTgeB49OffZD3/2N1ch78g1vZFevXvuMXqv/Oa2k0/c5R55nUEqaAW78wAbY0FxlXf9eSon5fI7JZFJlNbZardqqAK1I1m1wq3gxG+rFOqbgKiX7W+tONOngjNV9Y63SsLUwLX3czVZ1r4exs8M49TkATSvorElqk8mkMjUluG1pzck8l1ReT4GUgnBATZdib49PrzcvelpTOj3AjPI481LMBrZhtjbUfdsMyxSfltToqMwBT3hgvkC300MU0j2dTqeYTqdYrVaYzWZYLpdrfJc4jqtwts012QQau9ajBcJteUVLEiReD1AWZXX1YRhW7qgtOdnpdBDGEYTnwfMUyrKZ3Uuqp1SUtKe1goKEKqlGqWTkCvX7g24cRk9ube8OAVjFgb/+Mz/IvvE7P3FU9IvDOM4+FAPA/sCX//HB9tbw3b1W6zPiKPAFp+I6SirqWcG4CcSaMJzRH3bVBNbNc+sLz2YzTCYTpGm6VgkLqGnlNj/FTZHfVBui6RbUqex14RxLJrKKwkZJ7GBdGl6A7UDmEp1cd+AsDKJ2i4CHqaS+6btK9WoNcAUGssCklEjzDCIIIDg1d14v8lNPKjfj8/Q5AsTZIHdoQ2eBM8TWH2k0edYMmbm/jHH4sY9W0q7uq2X5zudzjEYjTCYTjEYjMMaqRaHf76Pf71c8DBdLcUl8Qtjj03PNMkrDt6A2GIMIfORFUbl45OpG4JxhmaY4ODjA9tY2woQqxREXyFiv9hmb8SO1Mgnx5C5JpVHkOUrPQxQHaCetuNvrvmHQ6z0B4K77OOPo46+q91uVi8tVCdYH2fd859es2bmPXb/+5Nag+1mdTrIT+R44o7wIKSW4R6BoLWbyAmtxtSYbcD6fYzweY7kkRV13Vav9ekv2srTy81LPm/t361vYsnzWPLZRG1s8ZjqdYjwe4+joCGm6wnC4hd3d3YqZ6hK26P3p4zblUcBLN3tXa7I2OGNU10RpSFni/v37uLf/AJ7vY3trC9euXUOSJNC6xmDs/XdT+DeJxTAYI9LXJubqJiEFS2UKAQXOfGhBv59MJjg4OoRUCltbW9ja2qosRTeUHYYhlssl0nSJslRV+4PFYlF12LN4llXY5GIukecl8pyK+hAhT1WuJOccN27cQK/XQ7paQRlXtChKrFYLzJdzqkdS5HjxpRcxWy6wtb2FXq+HbrdXYS1W9VNND2ksNJPfAo1SSsgiB4sEoigSw8Hwif5w8Kb3/q4/8Bu//s/+x6rQz1/7qfezb3/fJyaH5cIURxyFmz5mANgf+vI/EfR6nTf2u91n4ij0OGPVw7I/o2HIycA7B1RmjFVcCWttlGVZWRt1JIVXE9yWBnSR701irQzrmtjJ6HZOt41/LGg2Hk8xnc5wcLBfdRPjHHj66TdiMBiYAsh1+4Gah1BbFk30vz7HdQzivHNfs8oAMG471Wnk6RInJyf48Ic/jA+ZIr1PPfUUhBC4ceMGoogS/OrnQRm259G8ayIa1eGoWxi8XGMjC1R6qCMi9PSXyyVe+NgLOBwdYjggxXb16lV0u93KNRkMBuh2u8jzHKtVhtlsiuVygdVqhcVigcWCXvf7ffR6PQghqkVgPp8bl2eBsiRLyxLxLJaxu7tbZ8OasbBapZjPZ5gvpphNZ5hO51jOF1jdvYvxZIytrS3s7Oyi2+3WC4Nl+yoC4rXQYMZ6LFEiZdT13vd8bA37V68MB5/9pjd9xv/v1//Z//hc9RAAyPITk31/YYpjtVpUr7/nT3/92tR/wzOfNkji1lvCwL8aBgGEYMhzs5KL0xwNK1pr8EYo0mINWZZhtVphtVqBMVaF6uy+LNnLtgMEsKY87P5dM92mtgPk19p92pWLfGiBoigxHo9x585t3L59B0dHY5ycnOD4+BiMaWxtbSHPU2RpDs9fQXCPIgCeB8EZpFLgzDNWx2l36SyMx5yoscLqni6b6OHcUbAP7j3Ahz70IXz4wx/Gvf0H1SpswWJKH6cEQFqJCycacb7QMQUYk2tKoHk+Lt+EVmaywkpZQpcSeZZDayqHMJ3McHI8wu3btzEYDNDv93HlyhVcu3YNe3t7VRPwKKJIS5rOsVrlKArKNF6tVkjTtCpQLKU0GchlZYXGcd3Gk5LY/KpO7RpwDAVlUweyDLPFAuPxGKPRCOPJDOPxGOPxGKtVhl6vh16vV/GHGONQuoRWGpxpcNsfVykUjKHMS/DQR6fT7uxdufLOezuH7/zi3/2Hbv/Tf/yPUnMTdcDPVt6vplwg5XyjZmQA2NZwcL0dBW+Jg6QdhlHlCjBjSgPOINPMUH10NUeaEQ+7eiwWC0rdNgClVRyM1ZXKrbXRJG7ZfdlBYsGvLMuqStlkrcRVpSsLkVhQdn9/H7duvYi7dx9gMhlXTY+jMMHR4QS+dxutdguRUULW+iG8pVaaxK6khlKWTEXna3EGB7xFrVbo/tS4jQv8WuW6v7+PZ599Fr/5m7+J/QcPkJZUGX00GuH555+vFOPe3p5T6V1AqdL8e3rgbuqT4vu+AYNP4yR0f4vKiqM6HiXKskCapciXGdJVioPDA6RpCikLjMcTFEWB4+NjDAYDSCnR6/WcWiZk5VjOTqdDbtZ4TFXsreuYJEl1DrZZ+NbWAP3+0KQdeNUztdwaqtcqTDiXw4s4OKMx2SsUtnd2MJ8vcXx8jJOTE4xGYyyXK4xGI6Rpil6vhzCMEEcRpDKlHmQBpYg3IpVCIRnSMkcceEiSFuv3ek9d3R6++41PP/Pv/uk/xvP2Mf+Vv/Rj7L/4Mz9w4e7KJzJXhQHAO971bq/Tbr+plcTPBKHvM85QFtJJW3fXqM3SJBFZRp8l6ljrwK3qZbuyWbamBQGb1o39PMuIcGQLv1jzlZQFgXpS0nlYwC6OE9OAuoU8p7BrlmfY3z/AYpnixZduo5W0kBgQrdPpotNpm8SpGEEYVPRzS6+2K55tgWjDhkKQ8lBKVaX5CMex+SsOD8Ncz/7+Pj74wQ/iIx/8CPb391GWEnESoZW04XkeRqMxnnvu2eqe3rhxwyR0iYrRyirF7uJDqKjkNkriApDU91WaJL0MRUF9YMi9WGE+n2IyWVTKf7FYIF/lSFdLLLMVylKvRaoGgwF2dnaws7ODfr+PKIoqPowlcdkFI0molqht6aC1RrfbxXA4rLCPJE7gBwG0VsiyEnmeVdamTZ2wQ45zAc8Thvpu3VnqLXP16jXs7u5hNpvj8PAQd+7cwfHxMabTKTqdDra2thGFMeEbziLFtEZZMmR5CRFIBIFAK4o63XbrbZ1u740AnnemhGbey5IrX3G5MMVhJ/cPfu+fcmcm++3v/V3Dfrfztk47uWFNYwIcJTgTEEyAOsE6Zq2NqmzYvy2Db60Nt+GwZfLVjM2gogRbRXUKRDR+rI2GuJ3pa0Qe1R9jgOdRKbrHHnsMYRjj+vWbmE6nxl05wXQ6xXI5x3QypiiBH5hJQJMhSVpIWnUY0VZbd6NCVD5ArE0KZjL/PJPpS4PRdWtIgSgF7O/fx3PPfQzPPvssDu8fIM+pi3uv10dimg8VRYGTkzHy/COVMt7Z2akqYmVZXhVHtlaPi8FU+UKA+X2KoiihlERZSmTZClm2xGqVYrlMKzdiuVxhPl9gtUqJcVsU4OAIwwDtdgt7V/fQ7dbNsHq9Hra3t7G9vQ3fD0G9X/SpxUBrSl0fDIbgnCPPc3Q6HWxvb6Pf71NFe1DV9+VihXyVYpmnGzve1dZbjUHZMWqPS4WWKCnu2rVr1SJw+/Ztg72ssLN9BZ1uF54QYFqDCwHGOcpSYpXl8MMYYSgQJaEY9Lpv6Pe7b/uyP/p1/+of/r2/M7bPNdUv7zK+0nJx3erXffGKPbQ12Lox7HXf2uv2O2EYApoQfqU0hM/W/ZC1HdSUczfaYZsR2WK0bt0KgIrTur1SmgMBqLENOwDcGhfuvug3zjmxWuEkSYLHHnsM165doxV1ucLh0SFu376Du3fv4ODgEKMTivik2RKrdAmMCCwTQoALVG6CVRzWciJSk2eiCGEV7uOcCFJVFS1d19qw7gmBxxIvvvgiXnjhFqajMWRJeEa320W/34cwLp3v+5jPZxiNxsiyj2AymeL69WvodHom4lCucVaqZy01iixHbmprWCW0MEzPsixQ5AXSbGkqjmfGIqujVPQ8CZwMgxC9dg+DYR/Xrl7F3o2r2Nvbw87OEK1Wt1oUylKZ6I+syHdW7LPlnJtmWp0K57KLQFmWWKUp0vkKyxWNoUKWtCCY8oa2zioDA5Sidg0mPUFVXJ4My8WqGoPDLSKP3bhxA3EcY7FY4MUXXsBqfhdFXuImY2i32+CmGJAy165LibzIoTRZn91uZ2fY73321as3bgCYwLgrf+Nnfoh96/t+7ELdlQtTHGEQ4PvqIsQAgDe++dNFv9t582DQeWO312FBEKAossq8pf8YGLNmubv5OkhorQVb+t7SlV3FobVei6RYpWBlkwKx/9o/G0Gpw6bNdGmindPvfESxD62BdidBu0N9OZ54/DEcn5wYAG2Eydgg8cs5lssURVqgkMQfWC6XlUVhjykEB+McvudX/BNWZeKR+Uyl9+r+JTQZrfsgK1Kc0hpRHJkoQxdBGELpOh08jhNTLyPH3bv3cHIyghCiarfgYkzWylCKlIebFUt1YgvIvKTyj1IZgp12ro9V7od1JbudLga9Pgb9AXr9PvpbQ7TbLUPdD+H7QZUQSJZMCa0ATwjDPF6vh2KP43m2hURQLTZpmiJLM6TLDEWRQ2tVDTNVWVDNFhHmN2BUR1TatAFpcpMUjo+Pkec5+v0+/MDHm9/8ZrTCGM89/zyOT07AtMb169fR6/XM8+MAMyBpkSMvCvg+R6sVe/12+63ddvsz3vKZn/vhD/6Hf2sngM70xTJJLy5XJVtbARgA9tu+4Et6nX7v05JWZydpJeCMoygktILjO2sALotSQTNJfWCxHnNQSlWRFGsduCi4raXQbIzsRk/sezuYratiJ4GlMFtAzRa8tRaKnXD2vedxCI+A03YnQqsV4sqVAdLsOmbTOcbjGSYTAuomkzHm8wUWiyVWyxXSjEz1oighzSAkk7lEkZfIU1uw2KJAGpqTH1f3eTW8AbWOcVC7Q8J4Ogm1fQgCD5pxQ7hjELzudmdBy/F4bEoapo61YQhOVe1SS6ay997WEqVam4EfwHbT830ffuAhDAOTDZuYqvKdKgrR6/bQa/cQRiECP4DithiyhJQpilyikDlkCcNCrVmaliDXJNRpLaoeK1lW0LhJU8hCQuYKGnoNNHcXiHWryDJ/takjYr+jGipQCov5ErPZHPP5HNvb29jqD+A9xbHMMrz40m0cHOzD9ziEAFqtrilTRf9L8xJ+mqItIoShj1a7daXb7XzWWz/rc//FB//Dv60IYX/n536Ufd13feDCrI5PRNPpymy4fv3m1V6r/ZYo8Nocde8PDVQTkB7ey+/UWg821KadVbOexJ4BNGtT3v1r0sldnMNVCvbzsiwrxeHWx7D/cu5BeAyeB6eAMIPwBGIeI/BDdDpd7O3tVUWJKYycGgWYIs1SrJb0Z9mpabqqwDqliZKtSgkFiVJJajdoVj4piW/gRopspCEIAviBj9iLwU2leGYKBkkp4Xk+AtQTxrprpMyIEKa0IoWhyeKx+AvjHJ4Q8Hwfvk+ulueUP7SKIgwjhKbSGb0PKz6M7wsI4cP3AgjGoRlDWuSQqjTXIw0nAlBagnPfZDAD620pNtVdJYvCVl2rFgAFst4M0KykhEZdY7WZIlArjVqx232VZUElAhVZLOPJBGWWY7lYotNK8NRTTyLLcrzwwsdw5/49SKVw4zEPrVYbWjNILVHKEllRIFEBZXGHYafbbr9tMNh6emf32v3D/XtV9aRAXNx0vrAj/fD3f2sTrGCDTvdN253OGwciYiEYFihQqtxEBjzUJCIbazRWi2YApzbTDHUI1gKYNmRqY/R2wrvgolU0TaZo012xA64sC5N3wUB5JJxW/sKSxmji2MgKDbISSnEoKUCZo7b0nTWbBcLQQxTVCsoCtRRtKCplYV/bTmnuYHd7qyhlma05iqJOy3fL8bnd6wlUpegMA1kZcFyPptTnKKF1gYrFq+s6GoJ74ILB83mF0/i+D8EFPC+A59molA/PC+DyYNx+vtUxNVBKDSVLSKWqkEblvjKAUiABDUnKzKLVqBWHW2LRgp2VctVODxQoKGuxMUXPtESVDEgV423rilpB0GtVYTWuJWs72k2KFZZpiXJ7iP6gj529bYynI9y/dw9ZkSOII+xqhTiOwbWGLjVY6UMVIZjvI0zarN9OHttpRU+/413v+ff/5H/61YV5CNo/Aw98NeQTZXGwr/wT39rtDwdvaXU614NWBM0BXSgwUD+Rs0hfgCULWf4/KmyDohUUMrUD0CLeFpuw1PJ1ZirJWeFYGnB11MBdec5iatr91RmvWLNYXHH7bdhWA2Horw08F0+x598Eca3SsJO7WbC4eW4uLlNFZsw52t/YY2/anlLXqX9LrRQ9ikxwXYHFMP8ykLJ0q7G71+RaNm5ExOYpucrAnlfzHqwpfOczl+3rRkfce6RM2qoFOS27E0pDalvjtXQUTl0zlppJl0aZ1CFo9/7Z4+R5jpOTExRljl6vh6eefBJ379zB/XsPEIcJBDj29vbg+x6UqV5XRBG8IDCRpfZWErdubm1daYES3zQA/PxP/WDTe3/V5KIVRzUCr954vN/rdJ5pt1tt5jPkZV61AYCub3gzmYoevoSUljlaE3TcSlkueMkYq9wUt8rWeeIOQJu8JoRfKaPm9pve20iGvZZ1UxmnBpblHNhmTPYaXGarfe2yYF1RjWLFzUHrnkeNy9S4wFnX1FRiVL+DKlaRguBVBq7dj5QKXCvThBkgcJGv4S+u0rAlBewtonsooHTdNW7tnOw+4GANUpJbYSyTplJZK+xs3CxSSKhCuK7bIWUJLRUKWeMqlZumSoOzWAtsM5t2PZGOJMsyYAbErRjtdhv9wQCz6QL37txF4PnodHrotFvgQhCelZeIEo0gCJEkSaeVtB7jYdwFcAiH03Hq4K+SXJTiOOWmdDqtq61W9FgY+IxzDlkQ6q6kgq04bqUeYAbFblSasqu0TSwD1sEw19pw2ZPuRNkElFLokmjZpMD0GuDa3LYpmyyY5u/d41pFYz+jVdw+IgLcrNtG5y+c13afApaI1Dy2q0hd68JleZ5lhTWVET0Oose7za9d18VOJjoNVSm18+6XjdS7kRpb+UsbhaCc19pgYsp8riRhPHKDJUMKQ1VWKqRGqWEwIKssagzDYlh5XphFrawwjDrB0V6fBOeitrKce27FZbUqpZBnOfJVgTCIcPPGTcwmc9y5cwfx4SF2dnfh+x7COCbFVZRQpYYnfMRhFEShfy0Kwi0AH8O6wrgQq+MT4qrs7l1jg17nepKEu0FI9REKWVaovAtqum4BwA2/gRlf2QNnXqU0LK4xmUyqYsBKqYpI5XYba2IZwPqgtse1WILWGr6psm2b77h/57lWrrjHcyfipnMhTKXO8bAuXD35N+UpFBuV4qZj1N/VVdRci8jdtnnujHFAMiqxyGqiFxirlz+lqxFcq5TT96HeZ90fhs5Fgwobn7Ycmu5i0+2pksicY9H3tVJThihmU+it1UoZsWXlhuR5ZvAlU3U9r1tSADCAMIcQHoTQFfju8ovqZ2qjW6REFosFlIqxe2UPk/EU+/v7GI1G2N/fR7vdhmfajtpzif0AnufD98OtJIp2r958Utw3lcHwOrQ4AIf09SVf+oe7vW776TgMh8IXADfmrKFQu5PbDpK65aEHPxB1jxFdV2rqdrtVHokt6FKYPhmMMVPPwUn04ut5MNZ6AeCAlEW1nU3fdqMy7vYPdRManILmd640V+ezXm86RlPOOqZVUHbMNWtsrCsLV/moWik4LSQZKAKBtXM1XA8GQG9yobjBBqSZ2JsVRFNxNL9bv6azoiqoyjW47q2LV5RlgaIsiaSWZlitaharW4CJWLOowOYwpJahdnGxx3ZdZ/sZ5/TvapWCcw9bW0Ps7l5BFEWYz+c4OjrC9va2Kf7koSgkikIijmkchkm41e20b77pre+K79++NXNu/+sS4wAAtnftxpVOK3lzGPodLgQAAabrJsr0kJmp/6AQBBTDrtoGCLo/FgDL87ya9JYHMBgMMJtRVWyr5W3iXBOn2GR1uFrePvgoSqoKUu7A3LSSb5KmIjhP4ZzXSKl5vLMsibOOcXp74LQ3WZ9HEy8567wtdkFhWVat9tadoNxEaSyceiLb1gruytxUCq4bd9afFeu2EM5BoVD6TEJJGE6MrKzJ00qkQGYo9rPpHLPZFLP5AkWemf69FiyvQ/ScCyRJC2Upq65u1qV1lXF9L2HcogJBUEBrII4TDAaDqpLZdDrFcDhEGHInzCvheR5aUTLstDuPD7evtAHMccHuykUojrXclN29a2x3e+tGJ46eCnweMMEgwZCXjpmpgDQlPkan00GStBCGNjOTBltZZpCqgCzXq3VZpWCJXu12e21w2D/rfriD1J0Q7m8sdmLb/dn0+00m/CZ5WGVx1jYv991ZZv9Z719u3y9nCZlfQqOsXpGSALRJppPKRIEsD0QRAMm0zebdrKyblsWm1+41uN9ZUQYYVZpIadY6IJCzdkHckHZlXRY5VukC8xnV5pjNpkjTtIqmrDGNDWuUM7KUi8IyaRlR950u9m7VuVrRkctE4HuBMAyws7OD0WhESms2w3w+BxXtLiv32xch2kk7jKPoShLHPQD7uGCA9CLBUQYA73jXe6Jup/NUuxVdD4QPDlsA1yDrSqIsCsxmVISWiEpkbdgYuq3SVHcvo8FuJ7pSqsrxiEyrwbIsKzq6y4vYFJZzQ5+2qhTlN1DmpdY1Ov+w1sYnq7DKhzjru1pO4zMKCnbimkVO24JE62Bote0G96upvKUBVW3EY5Nl0XRD1hSHphAqNa9S1bghGnhZZfvaZ2ityizLMF/McTI6wsnxCaazKWRZP+f6jzAeYdplMGZIc2bc2uxrO1bsOa67xnVZCCoDsYAQDFtb22i372E6nRKDeLVCu92GKkvkRYGikAjjAHEc+a0o7MZRlDQfG16H4Ci7fv1mKwr9JyPf3/I8D0IzSEW8fHvJqxVVJreFVjqdDgAqr0Y9VgtnoKyvPK4lAQBB4EMIr6JY25Rry4DcFNN3H7CbQu95AZjJuzijvshrUs6zgppKsbIAlIQ27iVFOaowCGxrpHry12FTW0uk6ZasfaYM4VobW0Zj7bfuuTWtFHuOUirIsn6ubnMr+0e/1RXoOZvNcHJ0iJPJiFL589yguoTDCE5tGyk/yKtmqIaGym3LygLzOdUnbZks40330R5ba0Cb7OsoCtDtdpEkCWxNl+WSUv+l1lBFaYiIFbu2H/neYO/aTfHg3m2N1xE4ypqve71+J/DENSFEwjmDEmTWSmvKQoD6hlIewdHRUVWly076JheiiTXY35A56ldgFf3LTXQFaLWSapDZgWeT4+zqQoPE9iKhY24ynTfJa9ESOW1VnMaA6LqlwTRsFfNNv7W8EouVamhNmc+bFEfl0liyF+p91204T59LEyClZ6+oSbnWa0rDxTPotwxZVmA6neLo+Agnx0dIswWU0lSPFZQ0aIFxAud9eJ5ffa+UgipypEWJdJWhKKj6nFKqatpkcTigHqdMg8hlYEjTDEIwityFHjRTWKVzLJcLyEKitMovL6BiSp9I4mSn1Wpff+LNb48e3Ls9x7q18apaHhfN42C+78ee8Lvc8zhpbVvshVGpfqFNmTYKnc5mM+zv7yOKIgyHw4qh2CQQWXFzU4CawOVGRGqWJgPngrJJtVNI5YzIhzUrXSTeXVEeFkf4ZJH6HDe7Dk0cwb6u+RCWw+AqAlQ8EqXsqkorKzQlj7mTvKk0aiXjno+qQr7WCrGWjKWL23wR5XIyTJ9dayGuW5e0TVlKLJcLHB4e4ejoEFmWArDWEdVWDcOwKjNpLVghPNhETDrPEnleYDyeIk1XVarAlStX1vJXbAkAuucm9aEsUGqJMCKlYblCRVlilS6RlzkCWaI07jgAa3HstFrJkztXdtsAFqij3q8LV2XNDo6iIBEMbZq4HpgSgJbg4NBMQ3DqytXpdDCZTEwB2TGOj9tVLQ3fPz3RgWacvB6UNhRL7E9RtRUUwqSos5qhSRWzUG1f53pYXkdmYv/SEJ+A85TNJ6s0V+5qzNVQBEVDmPO6YU3QvzbSAVgoy2Ib60AnA2GJZK24nAqtydq0Fl0ztKq1hmYKTOuK2GXJV1ZRKKlQOopDScoxsfiFVRykbLSxhhRWqyUmkwkODw8wHY/BfQ+cUY9i3w8QJQna7Q7imFp1ep5fJSsCbviarBKqISIqnCyKqBTmZDJZUxx2iBCdXkGVObJcwA/8KiJDllOOQuYoZQGPUc2Qsijhex6iMGjFreRqt9vrgABSK6+LqIoV9vgTT4nIC3Y8IXocDJpT5yoGDTAKvQpBzYa73TY6nRbSVY40LTEez5AkLQRBCCEoXZqG+npehX1tHxxQT+SqjqmxOJr/nipEq+uQrBuus/u0mbtUuVtciMJoWjZNeXmw1nUD7HXWbpo2E5ox69qT5tBKAcyNCDBY/sVagpi2E5s60itFmIdWDJAaEuS7SEVWQ5WQBgD6NC1fG39HOgqqck00MUWlMgWDHYsCkup2aqlN/Q+bq6LXLBRbi2OxmCPNVwh4iIB7EFGAuNVCt9tDp0NFf5oWmAU363svqlIFSqkqy7coijUrmZ4Rq6waZpRmWWhkqxyyVBCcil4XuYYsNbRUKFEiK3PkZYFAB/B932uHUS8OQwuQvi54HKfwjc/4zHeFYRJd9zjfAudUEJAxaBTQzDIjYWLiMYbDAeazFKPRBPPZEtPpHN1u16RtA7DFfja4LEA9iZrRD7dPhku9dkNl7rbWH3Zdk9MTVIKo0mLjuTzyzTuDq/HxKKf1azI5JBzQpquVNhNrsZxjMZtBFsS2pWK9AbSUYFpDme5sZqeweSc2AY0mRlm9VsooFiig1CiNhcDBatq4yRqV2oYn7fNyLEijMKR2rQzrktTKojQREKWJTq4Vh9KA1GXlmpBSqkFUSywUwiTmaQ0/jExJwj6SpA3f907dz/q+1uOBMV7xfKSUVJja9M1xm1vZSFZFSjM0eF1q5GkOXUpwzcC16a8jQQqQk2tVKAnJAC64iAK/GwV+BxeoNICLdVVY0mqHURDsMI937EQFLLUYtOKAHkIYJuh2e4iTMY6OTrBcLjCbTTGfEzs0jOqcjE3hxOak2/TdpsjIaRP+dDOjJq5Bf5tbNjaVyKPwOM67hpc7703XYVdcIjABtjwANYya4OBwHw/uPYAsSgwGA1y7ds0QkELwirCkwJkhhSltA7KO4iDA1PaNVUrRb1TNqVCo732Tp9EEOS2mAc0dxqZVFiVs0WMX5CZlAyjJKdNV29+dJovZ5McwDLFYkdIPwwCdThutFtWlJRxFola+7jOtrSPO67afbolK66JUWzgWlXm6RCeQJVV+yzMUUkITeopSSZRKAZZbVBZgUPA9zqMo2g6T9vZnfNbn+f/n//ZvMlwQQHqRURV0uj3BPa/FOfeqZB8LslHuNawJLQRDksQO5bbAYkGVlOiBJBXp6FHuTVMJNGXThLO/X7swtjkfZNO2jyJnbXeWVWWleV1nKUCttVNrlSIco9EIL774Aj5263ncvXMPZVFiezjEYrHAG97wBuxevWoiSxYDMgFXqxSgDH5hJ6ZTAEmqekVVcDCjOs29VhzWjagT0ex3rlKoAdH13ru14jLnUQqUpiNck8bu3pcg8BFFMTzhU5KcrptOV4qIrd/ns+67HQNhGFaKw7oqruW3aSGw/JI0zUHZwHWuC7nNptVoSflIhqt0JUnim4O9azGAHBcEkF4oAczzPN/jwrd1MFnlI2tAM1DRutqE9P0AraSNdruF2WyGPCOizGCQAYjJJFQPd3+aE3vTJD/LOnBzNDYpDHclejjW5ctLU7G5r5uDd5O1cZZCtd/buqGHh4e4desWnn32Wezv72M6m9B9nk5RFiUYgDCO0el24HkE/pWyBDQ1AFfQJrvURD9MQd9qIkvCMqybAaVQmnBurQys4tgEqlrFUYdx11Lj15QGrdBKEYbCKgyFaptuUhzkpnoIwxhhEGG5XFQ9dGjRerhFoGmNWEvGzVtxn5V7Lq4FTAl1GaRUBn9z3W1dtWio6sJ6vB0G/rA/GDZ7JLwuwrF0MM/jQnDBGGOcU8FdVYFeFsGvyVfE3aBK1IvFYq2orFK2A/v6vfl4XINNYdhN27tKw4Kv9J6/IkrjLAuoSSI6zy2xzY5qE5pv3E9RFBiNRvjYxz6GD3/4w7h9+zbSNDX3QGEynyF/8RYgOOJ2G088+SR6vR6kVBWuJM3ErHAHeXoy19EPAvikTcGXGqokM7xWAmdTzimq5URNlG4cyyquWhHRc2lU91qbuDSGbPPxMIoqtmaariBlB1SuoM7YPU/sudqkN7fBefN5ukrDjiNLHSDeiYLvBxCiLjwFmE56ZQZqiAUIxrgvROD7wWZf+VWSV0txnAJGAUApxbjpXMMYozEta5yiucIzxiAMdZxWyBy5yVCswbeHWw2a1oI7iOznbijX3dZKM5vWKo0zb8IG1uAmBXPW+W563fzN6e/sJGFViUL3dxakOzk5wcc+Rn1V7ty5Y1p0csNtITdysVrgpdu34fkelNZ46qk3IIoiA/6VBD4qUgJSbVIYbpk+oqArbcrylevgZhPnWHuvjdVSYQ049XurOOrwMFkf2on6rEdr6vttyxb6gQ/N6vSEPC8QRa5rd7oIk3X9XGVgG3LZfj4ugHv+s1ZVywlKu2cODkjbUk2Qkvw+LsAZOAdPfD9IUKd2vOog6UVhHAwA01pDG7YX6Q9rhhE30EZZgHoiEOLNTfxbmaIqZdXa0X1gTeugqRzOsibc32z6/vT78xvgbLIQXg7/aIaB3XDyJvyiuWrVYinz1gqq928nwHw+x+3bL+K5557F3bt3MZ8vwLlnEgMD2GZLi8UCs+kMt269AN8P4XkCe3tXEMcdOr6qI1TWCrBlFmsQVlffS+OmKKWouLI2Voo6HWqtXRQCOrUCSi1R1yep3RpXgdQuCarX9b/rrhxZvESZ9wMfnu/B8wRkRun0RZGvRdJc2WQJuguKTbJ0Q/n2d/Z5Np8fEdJsRjbgeX4FqlrlSP1fiLMSCg++70eez6+046jT6fXZbDI+d2y+UnJR4VgAQFkUSinFhBBsHSzSFR/Dir2ZnDFw5+bleY4spZL4vk91Dc48gXNWdneynfe7pqn5cnKWBXSepWEHvrt97bPX4n62yQoBrHKpyVVNK2k2m+GFF17ERz/6PF566SUsFksIQWZ1u9PFsN8HODF2oYHZYo7pbI5bt14A54CUBa5evY44TqAkr7AHqp5VOkqjrnFRuysShTTFhJXlX6gqJGutgya+AWVCq0wZQLa+b25BneY9rK2NzViR3V5Dg5vGT77vozT5UFmWG9axd6oqXfMZWMVsyVtxHMP3/aqtZTMpsrkI1D10c9P8msH3PbNg2vwbc1/LEsp00AsC3wujYI8LMextXeGzydiiqq9qZOVCMY5SKw7GuCd8bjWpZQKaQOzGiWBJWkopFIVClmfI8hxhFK490IdxA9b3vfbuIbZYVyKulbDJotjk9pwFytrwZHNgu/tpTozNUkemiKsB47IoLJcp7t69iw9/+MN48cXbmEyIpRyGLfS6XWxtD7E13IJgVHuEmh9TNGs8HuGFF+gIRSFx/fpNRGHLKAcJartomZn0R6nohaM4qKSfjX64OULGGj2lRKtrrZQDoCDX7t26xbF+r63Fsf4c6BNtXVPNIJiA71NnvNViaayuFFmWm5KA5wPoVilYUNS2GKVEteVa9vVmSxFGySwNw9mrcmPIpaNAQlmWKHPqq6NjIkz6ftgXwg+Xi5kdAK96ZOViwVHOGfOE8DyPM7be7IZh86SxBB0y3WkCFCbppznZH01pnI9PPNz2tUVy1oBqivu7jRPE2X7TADtfaTRRe7taURLV/fv7eO655/Dcc89hPJ4A0GRptNrYu7KHra0hwiSm2+qZxtJFgTzLUZQFjo6PQW0AJITwMRzskGlftQWwOSElbLHfdd4F4RWW6elenybzAFXinEPuAzSYIatJKSFBBZzc+7TJQtukNE4/nxpHEJ5AFEZYeLb+RYqiyBHH0cZn1HxWSqmqZ41t+lWD+afxEfuaFkRK6rQ9j4PANxnZonKXGGMoCoW8NBXVFaP+ymCBUopli0XzBF+zPA7AwTkYGAQYE0Kw9YllGYhNENEAl04qttYmecnkG5zFx3h5eWUa9T6MlXOWsnjYbTZPiIcTaq5c4Pj4BB/96Efx/PMvYDabQ2siOnW7PWxv7aA/HCKOW5CgDvdhGKHfHxpeQYbxZIyyyDAaTQB2C1oBjz+eY2dnmxKyCllFPmw2am0JOKHXcxQHLR4AlGW0WoXCIA0fQzoUdTvpmkpjHddatyxdN4YsMw5m+vXUGdReVVvU1u2wFu86MH4a67ClK+M4hlIKi8Wiatnh/r45bi0gm2XUKIrqivpVzkqFtTCglBYvYRDMA2PUolfXrdhfVzwOaK3heZwLITjn1B5PmZL4NZPZNQmNP8htdmQdhnNvy6O7J3Ui28cr57kU9rNNE/xRFMJZJu2m35JYUL2eNGVZ4OTkGLdv38aLL76E/f0HyPO8Mqf7/T6Gwx0kURuUBqAr/zmOY/T7/aoh9HRC9SaODw9R5jaqJdHt9sC5h7K0LoiGKoFSSXrGyjQxsnksjoVAf4aCbdwV5pC16FolpN6scM+y1uoVXq89a23Zxtrdnn4rOEcQBoZ3wdaKPZ33rNwwbJIk6PV68DwPaZpiPp9Xzac34WWMUUnExYJafxZFDsa4KZMZVNdij+dxARTMVlusUy+U5kGUsOV89rqIqqyJlFJzzrnvC+FxIg9Zn5eBQVsLo6GN6wlZo+Sg4h0bf7tpUp2nXB5W8Zw3eDbhGedZBmfta81923AtzRXurP1asG02m+H27dt49qMfxfHxEbQifkAUxWh3uugPBmjFMXyfGnQzIbBcLVCUtMIlSYKtrW3keQYlJRaLGaQsMJvPcf/BXXi+wJ5U6Ha6AKiTnS5Bae/SgpcwSkNScttGxWHOXwFweqhU19hYWF7u+uvX60rdKg1XKdnfcM4RmOr5dsJKaki74fkCdhwaLwtRFKHT6aDdbkNrXRUDshbLpufLGCl3wkLmlZtClo+oLtw+d6kVpJKQ9h6ZshT6dJzg9YNxABqlKhjhojSguOYQyiO/lTdJWIRpWMuDblgJsBKMSzBIaF2Do00zsvn5+mfuxD6Nd9B3m9oPADbU2fz9WYP6LAXSBMvcz5qcEsscBAAp3VXV5RDU5fqpHB316bh16xYe3HuA+TyF1j6iMES3M8T28ApacR9RIhBGHO1WiCCI4fsM0/kC6SqF4AHarS76A9NSUgHzxQKFlBhP9uF5GkJwcA4kcbu6N1KZQjnQxBSFpZQDWjMwxSr9D/faG1aWhMU41JlWYvPerYudeI3vtc1udbAHTY2wA88DFwC1k8whVQatfTrvqpWENmOIkuuiKEG328VwOEQcx1XB4SzL1pSWVQBWkdiWnovFDMvlHIxVtTZgSxJqrapMbMYUJHIoVgJMgUFBSq18zhFH0Vn+9yuuRC5UcSwX85wDK6UVpNYQZvWxmZHugLGmNkAP10XNKYv2NI3XlUfDHQAY396dsJsIYWbrU/s5y/rYdG6bcI7TFoq9fle5NLcHasKXXZVoNc+yDPfv38ezzz6LF198EdPpFFozRFGIdruD4XCIwWBgwoYeOp0utobbCMMIvh+gLBWyVUpELw10Ox1KXTedzNJsiXSZYSSmCMMDakExFIjDBIxr6NIApjYjlTW4J04I1TXHT7l7G5jBzd+suyZnW3NnWYX2c8/znCJSVCeGokH0PGynOtrOWkX0lyQJ9vb20O12oZSqCg03Q7AuWcxSzBcLqvRVFGVFHqOWHmQRaV1XUqMGeuvXx6FVqcv87p0XbcTgVY+sXJjiuPHEG8Qbnn7T24MgeA9zSidR1rAGtILQ9iFZ5bDe+pEAImoL6LIiH1VOWwN0f+tGQI2K2ZXY8znLElnfZhM5bRMXw75ef28H+enkrHqiGc6G0mY1BBjXSNMMDx48wLPPPotbt25hOptCaQ3BfcRxhCtXtrC1NUQUxQjDCJ1OC/3eAJ1OF0KQf0+g6BJZkUGb5kFJkmAwGFKT5eMCRV4iXaU4PDyCJwIEfgzGKAqmzWrMNABmrQ3rpsBYFvae4NR9qO8FP3W/N1lzzX833fvmds3oBjVW8iH8EJ7wUBTugrXuUrnUgSgK0e/3sLOzgyiKsFgsTLHhBV2BSbNvXiNVOKdISppmxk0JKpCW8A+yuBmz+B5HjfOR28WEGDA/fPMXfcXXfuif/+p/cxvr8trmcTz2xNOB5wdPM3hvhgSYNgpDUfGYClGvaiVQpzI7qCxtGabCFCkPt8lNDQzC7OvslZ/BTsimPIyLcZ6c5X64Lkj9O9eMrs+7xnLI2qLvrQIhgJeiSgxSkUVAzayAUmY4OTnB888/X1kaRVEgCmMkSQtbW0Ps7OyYokiBqTvRQxQlpukPVUnrdrtUFT4nBqnWump6VZZkXi8XGkUhMZvN4HkHCMMQgEYUJYZDokA1O2wVdAbqcE9ugkJJn5laJnYl1VThwzqpgAnNnnevm3jQJk6HK64V4HxqlIflDWnDTyEeik14c48bhhEGgwF2dq4gjmOkaYrxeIzZbFYVjnJdE3tsoK5uPpvNqqZfNppC3QIBykkx4LEp4myrwMNEWRhDRwjvsVarvQugqTheFbkwxZFlmU7TbJlm6Twry6iQEh6vTWwNDUhddTmn6lH1SmGTqADrThCtmgrnnM0OPPuzh8EjTq925x3Dfr5JUVhZH9BN/7tJlYapkuVSqy0wAOgSpp+aZWoWmM5GuHv3Lu7cuYPxeAytiasRRiEGgwEGgy2EYWSURgv9fheeH1SdyqQs0Wq14Pseer0esrKo6mcqRZZHq9XB9laOEdeYTmmCTKcT3GUMUpa4cmUPYUgFbCTcOhb2vlMdj9N4Vv1a1yvJI93/TXKW29pUHoxZ3pDTH1ijqm9qp4t9hkJ4aLfb2N3dxXA4hFJUItAq66Zis4A1Y6zqk7JYLLBarQzpiyOOo4oDUi8WNanPgs6wuV0M4FRjKde20c0FyIUpjqIodCFLWUhZlIpCc8KsRtoQuxQDWNXElxnl4YbVqEKT6w+fZ7a6cvqz83GIWviZvzuNS8C4D3VxolopoHpfb7u+Kq4pGcmoJL7DU6g7opufSFuykFiHi+UU+/t38NJLtzEajZDnOYQQiKII3U4Xg8EA7XYLQeCj3W6j0+1Q8mBKhXwWC/LJO50Vej3iImz1+yjzDKWUWMznkKWE4ALtVhdllqMoFVarBaSUmE4nEJyDC4Z+r2dCvNSpj65R4TzL+eWsvaYSfrnfP0y0bJO7QkrDFiO2z7EG3u1ft9vF9vYOBoMBPM/DdDrFeDyuKpy7isn9A6hb/XQ6wXwxQZotAaYQhAGiuG6O7lxpNY6kNKUC7DnTSZmIZP0RXuNRFea+1GSTKmbwG2nCS7YDPYcdXHayEgi1ZvKv1cpcD+01STkP63Y8qktyljtC/67H3QE0lJ/5LTNKRWoTWNDrbolTm8L+K6WLj5D5TI2niWi0f7CPl26/hP39w0ppUHOgFgYDwjCSpIV2u41ut4soisi0Ppnh6OQEeb40ZC7KlxgMKMR4ZWsbeVEiMyujUhpceGh1Oii1gpYlVmmKoigwnozBqnIHAmEYg3FWuSw2MvQw93ft9RmLwiY3BHg0bk9zO3IZKBTqpu9TyUVyj8MwRK/Xw3A4QBxHyLIMs9mkooxbd8y6zLYItrUiVqvUFONeVNaG74cIQ8pxca/Vuqj1tTawFgZTyebju+aPRy7M4mCMQYMprZlijENL1DwOaSwsrmHdA4sBEMeDA5KbwrNubwx5JiLvSnOw1QrGAlbns0jXt7cTmV4rJU5ZD25eAh0QgKmQVdeNMNbJWrcyNzt0PevTmqzWXalTxTOqrXF8jNu3X8KD+4fGcqDKVnGUoN8boNcboNVK0Ov1MRgM4Pt+1bdmNJpjtVhBKYkgYshz4hVorTEc9tHudrFTlMgWKxzmR0jLHFxQ9mYcJcgTKiyzWi2R5ymm0ymER20nBsKDFwjji9uIQv28mtT6TYrBvDjzu7MszfPGxCaplYatZm4tXluTlt5bdqi14MqSmjkRXTwHY3V9WiqsTefFOUNRSKxWK0ynJzg5OUaapgAYcWvCBIEfVtuTO8LXrFTSG2aRqSJT1QLzmmaObnxSabqELEsppSplSX4708SaK6U04CgjbgYo7MRANTG1NkpGKxROUx0y3cWpAecOyrUTW+NFWCUFnG06u2Cl/beJYZSnLI/TlogBcxRV+VYGbFv/vVvDwobfNlfDsgPIdlafTqe4c+8OHjx4gNlsBq0B3/cQhTEGvQGGw230en10Oi20Wi0kSYI8z3FycoKjoyMsZtQsKAw9CEYRgOVyiTzPTa0KKt473N7CbDHHapWiLEpoRZW8W0kLUuaQMkOeUyh4PBqDMwHPj9BmAp4HigxoAjqtv9+s+9p8lspOujOIfefJWbweexy3sbf7W1szlBIotcm9sSQuagw2GAzQ7Xbh+x7G43GFa9g5u14Iu3a5y7LE8fExjo6OkWYplFbwvABhGCMOQ/h+AFsEmqwUa1m62B4qfMP0xJWaaf3xWlkfj1xEWj0DwF762EeKdLl4kC3TozTLn7SIszKZlAw2pFjh6KaMIJlg3HRTK4sCZVGuNdmpJ9PpOP3aCTEbqSEz1P7chtuaopQFpqypeDo0uilPYv03BmAjE6uuR6HcSt6U5+HWy9ysOOqVmgZzYWpr3MGdey9RKjzIzPY8H51OFzs7V9Dr9Uz0hFbIPM9wdGSUxnIJrblpMERAszTKqywVjo+PIaVCv983pvkQWZZhMpmgLG1qd4AkTqBkCa1SFCVVaiPFEQJg6LSpELd1y3DqPp12MdddVKx9t+n5nhqA50ykTUWZ7OQUghtXZd0CtNdKoddtBIGPxXKJ5XKJrEFNd6Mo9nWek2VydHSE+XwOzjgEF/CEh8iPwD0BO/K1BpTSG8YTADAwQwgzSYWFyst5tlzNzr0hr6BcmKuyWsz1vTu3X3zzG95wK8vSd0lJhXiUmTgaoJLwnFW9PKAVtBIUOSCSAqTSyPICeVGCKmmfNnHPomTTe5oUNEgAG5HYpDioLiZ3XIvTA3oTUOtaEVppQHIoVvvKdQk8+75WIPVgcQr+Vq5L7cIVRY7VaoH9gwe4e+8OxqMTAADnxAHotMn/7g366HQ6SBKyNJTSODw8xsHBAebzBWQp4QsBzyN/qijqFVgxbYA+CsWSq9NDnmdI0xRSkntDPn9sktwY5EpDyQKrdIXjowMAEpxrxFECzn0H09lE+lt/ju6C8LAWx3kKowmGNsXtsWMT28xoILB4axs7O9totVqQssR8PqXqaYYo1wy7utav3Zft05LlGSaTKcosA5Xy8ircykah6JJZPQZB7UOE8AFdWZ2LrMjuj44eHD/UDXoF5CJKB1afzaajZVYW98vK1VgvUMI5AxcMXAPa+HbM5VtwBqkUVmmKNF2hKEv4/unq0U3r47QPbGnswEYAtvpDNWGb+2m+dlH02kIA+aH035oiWCdE1eCbdYeaNTVdi0Mp8pOPjw9x//49LBZzUKk5D77nIY4TbG/vYDjcQhwnSJI24jhBURSYTmfY3z/AdDqtJn19jfWgVybvUHEgTzOcnByjLEu02wm2d7ZMqvhxhYV43Ku6syutkGVU1Hg+n4FzmEjLAEncBefex60UXk7Oc0+aSqMJptfugMsRovP0/QCDwQA3btyouCzz+QxZmpq8EaLdV9X7nQXFzX0ZDolHUxQFTk5OcOvWLRyuViaRsK5u5rqy1jKl+UBYkceFcVVKlKVKy6Ic3/7oB5evyE18CLlQyvlqMZV5UZwURZnLUgdKlWvFbl1CFGMS0BzchJmEEBCMQyttsg4XyLIUQSAqs9cdDOcrDlebk+KoiFn2BOBoe1WHvza5KtW/xqS25fPcyAhtWxfudcO1tvamu2/pFP6tj0fv03SB4+NjHB7tYzIZQ6nScA8Y4iRBv9NHr9dFt91Dp9NFq51ACI7xaILjgxPMp3NTst9QoAUgoSA09YexOSWMAaqQ0JwZBSHBmEIY+bh+fQ8wDNMsS1FI8r/DMAQURYWUXEJpicVqDhzbSm+BaUVAxXGaCr8pZ32+6bvmsz+NcdXhVTpm830NgtZrH/FghsMB9vZ2TUMwH/P5DLPZHEWR0+LAOUTD2hBCrBX1cRPeptMpRqNRdf5UYrCsFMT6mLUKjDA9xjlFqmAWJKWVkrpYzKfnU5pfQblQxXH79gv5Il0+WK1W4zwvroRRDKVshy5FTXs4o3CeBoXuBMA0wBkngMzkYcznBNJFUQSbKMUFB2OqmvBWGGsQp4z/CLvammrdtBU3sXGY35ICYFpRJnPDxFaVS1IrlbrKFZyoiTJgbl0/0nVpyNqoMRMHKa+2sfuYTmc4PDzAaDxGnhfkxTEN34/R7Q7RGwwRJy1ESYRWpwUhOGbzOU5GJ5hMx1SaTlD/XM8zRDptetGZfh7WGgEAqTXyVEGqOUqpsLO9hV6vjywvsJxPcXRSIE2Lysz3wxixuR9ZnqLISyz0Ep6YQPAEnhAQPDTPhlXX/fHIJuXBnAdoX9c6xFDzHeVS0fUZuaVC1BX0bar89vY2trYG4FxjOh1jNpsgyzJzbH5K+dmckyRJ0G63bQ8UYuOmGZbLFNPpDGlKPZQIiLV4Wm3BVmPQKBDGGPW25Qy+ZmAlJRMrjaJIV69qJMWVC1UcBw/uyfHRybOTyezucpVeiZMWpNIolYQuJXE0ODcNqAGYRj9KaRpsggPGTB+Pp1gslui0OpWGFkIDTJm8DDfEWq/YJAxKuxiF0eyGgLYOnK6v9sC6e1JP/rrYkBtObf62GSUBmCmvV1swrptSWywMZZljuVxidHyC8WRiQnl0PUL4iOIW2u0++oMtdLodJJ02wjDEckkWymQyQVpkABMQnOpoapBryBgDc7gKNhu3Yk9KhaIA5vMFBASUVoiiAHt7u8hLKhNor8GutITZSMhcoixKLOYL+GKMKAjheRyeF1QTbVNR4KbLeZb1YZPPmkCnu/0molf9uX3mNvRJVijnDEFAfI1Ohwo0z2YzTCZjrFbU1f6syIztVMgYQ5oSZ4OYuXSPl8sV0jRHWbp5afV1N0Upap1J+6ZrZkqjzCWKHGUudZmulq9PxQEA9+/fu79cvvlemqbvoG5VGiglZFFCsTp70B0kNnYeBQHAObIsxWRC+QDddqeqBC0lryc8r8N8p/1dXYGydVl9VvmQ0OTta8aoUK5W0Iw5dUFdN8JiLLZnqsRpi6I2P2uMY10JWf+2Tqiqf2snVbpc4PDoECcnJ0hXKSwFHIyIWoP+AL1eF51OB71uD0mYIF1lOD46wcnxCOkqBzOJXJxbF40BBt+g86D8EZicIJtMSLknGmVRYjyboJA5BoMe2t0B+v0VsizFfL5cK7SrVEhKUUsURYYszzCfz6qSeJ0OJdRpvT4B155U47PNgKZrPay3K3gYxWF/RwoT1TkB1JGt1WqZwjy5qZuxqu69W2fDjlsXL8myrCpxQEV6iN+SpiusVstqTLmKpj7f2gKxkT3GzO/AkCuFvMxRqiJVWuenbsyrKBepODQAFEVeyrKcVaFFM8lKqQC9/jBsXYmyLKnBTRTB832s0hWm0ykmkwn63R7iOK4GHuccGsoM/XoguaehNSAVJQtVJezMgEE1UCk7V7scDif6USuO0811TisHdup7OGQwrS3hZ712plUYUlL9y/FkhMOjA8znM6qcZszrKIrQ6w6wvbWDwaCPOI4QRSGKssTh4RFOTk6QZSUYh1GylitizlvZeqElCikR+gGVrIONKDFwECbBwaBLjdUqgxAzxDFFa7rdHrKsWCMu+b5PgCmI3VpKiTRbYjIZwfPJgoyCCArrUQd3MjcVx+YqWuvf28l3eiKui6s8TlshtdJijCHLMihFtUEt4GmfqduwvBplmppeFUVRtUbwPGKEKkXfrVaran82ikPXrc34Wy+2rBlFHYUQ4IKwqKwokMsyVbrMTl3gqyivluKwiM6pzzW0KsoylZLKvEtli7yUFR7gDiBbc1EIYVKORUVQsjUPbDahUgqCURl9bjqrM0b9aZlRCtrwRZQtNS/XJ7nSqhqJRt/DrkDMcUc2uR2bFIgV1ficwVR4d5THGpAKXSmOosgxmYxwfHJESH62qpKxAj/Adn8bO1d2MdzaQq/fRRAGyMscs/EMJycnWK0yMzk8WOVUTShoFKrAYjGvcizaSYKo1W60LpRgSlRPVUqFxWKJstSIogjtdgerVUqDOcvo94whCAMCqQDTHU1ivphBeJR+z7sDeEGAOqJDd/1sgPOsUOvZPVnPCsFuisABNc5kxx+1KKDJbp9Ps6KXux/XUrZ/ljxGhX8ou9gWMbap9DaxrnZj18cW4xqeJ+CbKI2UCmWWq7IsT7IyX5xxY14VeTUtDqs8XHABeV6ooizSPM91XkimFfHsldtpfMMAoLJuHnzPhwb1n5hMJphMp4jjGK1Wix44N1iF05DIrN/V2SilHcVRtxXU2mabWmmsPNq2FNwUKj2tOIiSDmhZ0+jXlJRVQNAETtr6FaDXUEApyTwejUeYjEcoS+orrDXg+z667S62dq5ga2sHcRzD8wU4AybjKUbHY2QZ8V1stIAmtF1lNYqyxGo1w3gyqgrPFEUPQ8HB48QMZvswJQDPvJcoZQm1WgGgIjiDwQBSStPIiB47ZwKRH5nGRwpZukJZFphNp2CMIxAB2sIzHeQMGLtOJj1n4juDTWPN6rS/bY6lpkJqWiiABaFVtS/f96vf2c5s9vdNYLaJeViio1UsZamxXC4xnU5NTostIOStZc9uEgHKyBWeDw2GsiiwSLPVsihuTQ4PTzZu9CrJq6E4XGuj+RpSSp2WMlumeZGu8sDzBKXLV8BcDRRxzkw+Cj0kLwhMO0gPsiwwmUwwOjlBzyRsVdpaaQL0HLdDU2gEJhEXNXeixiSgFGQVlbFei9MRTZ1WDu57wJr/7uf0GdMWU9AoHSCUaRAQrCS5NPZumWOlToWoNE3pOrSG7wv0ej1cuXIF/X4fnAuyGHQJzj1MxuOKFdpkMRILUkGWVCR3PB7h5OQIaboClfWjPBfOGeK4ZSYEJXxxTVEEaYgejCmsViuEYYgwDNHtdlEUuVFCJTg0NBcIg4B4o1pBqRRplkGNJ2glLYRxsmbdrBOvSDZZHu5HrpJoKg53exfPcD+vJ71VXnU5ACFEZdG62zbd4KbiqO93rUjyvKjqddjvrdKwskl52KgP5wKce4AG8qJAVhTjVZ7d2n/p+bndHFhb/V4VuWhwVGtAFZksslUmiywDYyGUAkplePfaxtYt18Jqd6JRx3GCKIgwywvMZgucjEbY3t5GHMc1AclM6DoPor6PtpK2Dc+S4jCEHSlNU2SsTXzG6klOF7GuOACXen46aUtRaW1SULrSFGSNmNOrkuTMMTgXBljU1JjbTFSpJYIgQKfXxnBrG/3tLQRhiDTLMZ9PwIWC54UoClntkwalACWZUZGcUpZYpqQ0ptNp1W2MMY5VvsRoPDIrYYAgoMQrrhmULo3LQ6X1JDSYlFXldM8TTvUqTVEyRtXHAp9BRRJSFihlDq0KKKcwcT2Za0ugGbGwStxaTe62Tctik+JoApjud/SaV+6rVRrWlbA1Npr7qu/x+mfN91TNfGmyYueQUlbWhsU43H27LrtSNGw830PgeQADcimRF+U0y/Lj0fFBsxbHq6o8LkJxaOcPgnGUUpZ5UZR5nkP4fgUOuqsMrdS1+Uo0XI5Wu4M4STCZTk1NgymOjo6cOo1srQEQ7atmY9oHUgOQlvJNVo+qIi7rJf4I40Bjf6o615pdSr+x1owGKsVht3X3oS0BqQEJKS0hBJXrj5IEUStBWmRgOdBK2tjevoLBcIgopqK2aZri8OAQaT5HECSUQh/HYJwmGQ14st6klFiuFhhPRhiPR1itluCcJggAFGWB2WwKwQmAGwwGCIKIaj6Y3BsGVPiRvV6KrMywXC6qMCMzl06T0EPg+5BRAs49BIGHKI6rru71pFkPqbriKoxNk9bKJoti0zb2tRsVcXEJ23Xe87y1/iruPtxIoN2/q3jsmMwyyhyeTqdVKN0qDssudcdI8/o55wj8AF4QmDmjUGg1z8sirZegi5ELtzhWy0WRl8Uoy7PZKlt1/JAUh23O2wxvAesDIgpD8uU9z5SvW+Bwfx9REFTVoTkY1YlwJqmNhGjNwHRNAdekoch1IejUNA0yNHRtAFMNcOVW3Kr5FRW6DpjCyw5+oTWUqiuJNSdCdWMaz1xrSSayIBwDIP92uZib+hpDtOIIUJyqv0sJqSVmszmUWkCZVTiKI3BOvAuttUlAm2M0GlVFZ7QCOu0Ogsin/IvZHHle4GR0BKo1GplyegEYPJRSgTMFzVWl7vI8w2q1xGh0gvmcrGbfD1EPMXJBheej3fYQhCFarQ5aSbtSHPWEXM/xaN6p84DTTYqh+Z2d0G5UpMYg6gbRlo9C7rEwz0C8rOKwLosLQiulMJ8vMBqN6J5rXdUWDYIA3ileCYlgDKWxdqknbYggCFEqwqdKWS5LKVdlnp/FoHtVlMmrDY4CjejKRz/yH1ef8dmf86FFmt1dptlekihuO5pTQRNbLWr9odrPGKe0ZguGLlYr6ONjcN8HEwL9QR9xnNR4hw2nNjAIUgiN1V9raDTySKRRJ4qCihpGmVhg1EZrtEYBkEthlUO1Yjw6K9K97jCMMfQDBF6AWTwzPrEPDVIatDoytJIE81mAyXSG8ckxBAM4H0BEDAysyq8YjUcYj8ZYrZYAA1pJB91uB0LQxJGFApCaY1PKN+eesbpKMKagOaCVNKY99Vs5OTmuiE5WGdC5UtanUpTz0el0MBhuodNqQ0qFLCvMNVPI1xqe68Bj9cr5rF6h7bjZ9N1ZYdlNuIhSdSV3t3m0u/pbpbPJ0nDfW8VRFAUWC1Iak8nI0P2p6VIQkiKAEDRewADGafIwcnM1M6FYTyAII/jCQ77KsFqtylVRnORlOpmOj91Bphv/vuJyURZH5apMRsfq5PjwxcXWznPLVfaWvChbDKgUh+vXAaeL4khJodlWq4Usy1AUObI8w+HRIUpZYjdLsbW1hTiOIQQReiqEn6+HU9dO0FgHjCilFCY1CqNya6zVIC24qg1HobYw7J+oJv7LhxM3WSFamegQo5Xa83x0e33ESct0GCsrUNJiMnGcoN1qY7VcYblYgIGo+qynwbkwrNNjnIxHSNMUVD+0hVbShhA+GKMeKUEQIYoS9PsD7O3tYXt7G/P5sqphyphnYCjimBCTlyyY5ZLyrDzPh5s8R1XDOLrdBHt7VxFHbbOyGyuTsQrQJnLaaRelKZsiI+53TdfFtWKa29Yuru19K9esjU14i+uKWLEuqu0CV5YlZrMZDg8Pq4xky0uK44TydnwftsgRjQeAWazNWlgCEJ5nGq0zpIsFprP5fLlc3T45Ojhyh87pO/XKy0XwOE5FVg7v3h0tr934cJYOPz/Ps5YnvOqGu6EuoPYV7YSUSkF4ZEJGUYSyzFAUxMzLi7x6uFtb2/BNNSWyDADmJJIBm31JTuodgDbFkVH91j5ISymXLjiqFWAKC7vitnhgzO4bFbfhzBvIdIV7KKXANaOBE0ZIVykWywVWqxylpEbHYNaUTdBud3ByQpmrwhNQukTge5hMZ5jMSGkI4SFJErRaLURRbGqfKAih0Wq10O/38dhjj2N7ewtao2pjqAAIcsqglMJqRVW9RyNSGlIV8H0fvk81VDQAVWoI4aHVamPQ76PfG0JrTd3hDKmOaw3NTgOcm+ZB/Rv6fhPGsUmpNC2PpjtEY7BEntM4svfHjfjYbS3pi3NOpDhz6LKUmM/nGI8pJSDPM3N/RqZCmKQiS1GEOI4RBOFGUhvsOGQ0BoUg/gYVMuaYr1ZYLJeTZZrdmRwfuhEVvMzrV0QunHIOAP/b///Xp29801v+9ytp9kJRyKsC3OOoQSl3IruAlMUqOGpWIg0+qguRpRmOj4+hlEJZlhgOtxEExIK0kRSyIowiYacZisrSjRuREWuRWIuFIkB1dMa6N3awW0uJwmcm1Vprk0BnBqvBUAAzBTSrtKzgHFVeHqPcGkgFCQnP95HECbIsRZZmUH5JCkoDfhCi3ekgy1LMZlOMRidYreaEjyyXgKY+IEnSRituQfhkPZA3Ryb/cDjEtWvX8fjjj0NKiYODA8xmi8p6YEaprbIU8zkxeJerBZSW8D0PQUgmuO8HYJwDSiPwfWwNhtjaGlZ9VQEO26iJEhutUmVglXI/282z9UstYGpBWOB0lKPpSlhXo8ZTbLGdsqoBSvVZWxWu4YZy11wfzuF7wmRur3ByMsLt2y/h5OSksjrsePA8Ydi2MaI4hie8tfFXX5uNvNWLm+/7CIMQHuOQZYFlno1W+erBaP9ejgsERoFPjOLQWZaq+yejF/ey/GNZkb8jYLzNHXMRWGfm1YQpk+WqQcrD8xGGETHoSmpwnC6XmIDadyup0Gu34YchOPdoZdAaiikoTTUUrDHkrj4EmLr4h6WIs0p5kW4R5O8bHIP+pUbMljlZltSqTylFPAyl4YcBwiBA4AfgRoEwzQxpzYQhpWlBbhUMqMZkaZiGfhxDmtYFZWpAOCHAeYgokkjabSglsUoXyNKV0T8KYRij1eoiihL4PAQgIGUKBeq03mq1sLd3DVtb2yhL6kg2Go0rn5/o8wyrfIHp9Bij8RiL5QylzOEJH1EQU8FdLwY0BwcQJhGGwz52dofodNpI0wx5kVFTagYwQfiJZfwzBmeSCrOgEEZDhZQzKEXp7nEYQoQBbEIe58JR4LV1YHEm+ljDZr/Wv6NxtkpXyPIVpJaIIg++8NZo4fZfu2/GTZlLpsAFgdHdXgvJSYjjYyoiXRQFPI+A+zCMkCRJhZ3Y+b7JWiJsjiKLvhAIgwih5yNRGoHUapXL48kqO3jxuQ9eKN0c+ATkqlg5PnwwSdPl3aIoUhX4bS5qQMnlYNS+KV8jbDHG4AkPgR+gDKiLelamkIUEsALjDGVBncaSpFWDXBpQzA5Sm5mIamUnXEQ7K56ulIeGi5Gsg6qAXfXKNfdFa7KEbP0GpRSSJEa320U76SAIAmMtWFDYTho3dEssVM4Zdb6TJQAPURRDa4353DYrDgEmoTTQarXhcQZvIZDnRG32PI44biMKW/C4V5czMOa+TR8fDAbgnOPBgweYTMaGeFZzC7I0xWQ2wsloZGptSnjcRxRGCKMIQUB8Duq67mFnewfXrl1Fu90m5Z6mSLOC6krY8C6nzFTb9EjqdVxDqgyr1QKz+RyL+QxQGnEroertPofvBWBcgDN+huJoKop1ywMg6zZLV1RjQyqkaYbJbAY/DBEEgQF3/fV9G0tHm+eTJDF2d6+gyHOslhlWq7Tia0RRbNpTRFVpQtoP4C5g9eccjFEOE1nYIXxfQAuOQuu8KLI745PDe405VuGJr6ZcJDi65rD+X+29abRs21Ue9q1m99We7ravk5AAISR6jJ2RESdxEjOckcQxEDvDHokJzrADiTHOsB3AiUNjYmxsY8A2BuxgsEEgIUFQA5JAT/2TXq/X6jW3Pfd0daqv3a+VH3OtvXfVOec2Qrqv0Zlj3Ft16tSp2t2ae85vfvObV55/cpZ+07dcTtJ4WvruBmNGmEQRn0Jrgh05J3EZe2dvgpuccziuA1/7pEOaFSg0zePETKMsKF/1/XmVr3qeByEFmBDQpjuW4hfKyXOjuG55CrVzoIuj/v46Lwbq0FKj1vcolUKazjGdDDGZzo32ApDnGTm6OEGr1UUUteBKYRzi8pjJ5oVkw9aioBDW8zxwHkJrmoyepik0GKQj6ML0fABA5rqw/T5SOHRXZgzKYEqOIxFFEba2tnDu3DkwxjCZTAwnY1EtssIcz/FkjOFwgNl8RpPfeI05EQnMgVK27f4czp+/gF6vTSMEZjOkWQZm9Dapb6eOrCj0ByQT1AGaZVjEc0ynI8OBmCJNTcVn4SHLE5S6QL+7Ad8VVQq6DI7WLNPVsmkzJY7jGAvTsZrnCgd7A+R5iYODgwoLarXaCAKv6o9yhDDVthJZmiLLqO9nOpshTTOQ7GLz+LhLU+gt+G2tec3VGA+poIcBVbfSokSaZ4t5Mn959+qlu0o1t/aKpCoAsL97vZjN5leSONlPI+8Bx3Epl6eCqEHsSzBNwiWcEtnanZqfOSPxGOk44EJAMCAvVcXyS9MMrpsgjmPEcUwXQBBASAkhJXkzVaAEA1fLCDlndcpikhVzUnnlTICmM1MVH6MoMswXM8xmE0ynQ8RJDg4OIYVpWsuRJSnKXIFpBh2QYDDdcdFIgY4xRQ1OOQpI6aDb7oFxjtFwZKIymDiXKiTC6F4QANrso6HPD4IAZ86cwZkzZ+B5PobDIYbDuvKidU3wGo8nFds0L1JI4cBxPFMh8IkODWpHX19fx/nz57G21odSpEExn8cmsqtTCiYYpSycQ6uyumeWynBORocYDvcwm82QJBmAsgJs6TwDTHP0ej3TekDbQM6hiYUsYxM2GtGaVOUWiwXiRYI8o8rKeDpBnKYYDIYIQ+qHarfbxon4cF2nAk5Lw56dzWek2TEaYzQaQakSrushDAO4rmNEoVnDYRyt7q0sFQCA63oIAh+KlZjnOaZFOZ7m+fXBzuUEJ0cZr9ly7NF6ZP263t/dvj49s/lSp+V+kxCSsk5dcy2qdMWwRps05CbLlHEGIQUcVyKLKZS3FwtdGCTZZi+OMIoQtkKEfli1OhOGUQ+zBoCiBHjj2KvKcTSFiS3+YUN+oChL0/o/xWQyQpbHEMJFFLbgeTQJPkkyzOcLZFmJrCix3gc6nS4Yc0zkYbbquFKtibZst2YYhmi32lClwmQ6RZqlEJyZsB21CpnBeGqgzjFT1s/h/vvvh9YaBwcHmBhWLgezxWYURYEkSTCZjDAzowAYFxDSgeO4hl3pgGasCvR6PVy4cAFbW1tIU5pna2fQEvC73DNiuSiaCTANFEVuyrwjDA4OMJuPkef2vJLuClV1FtjfP6AUViusr20gDB007+i14zi+edLuWxzHpqICg2dwg5/FWCwWGAyGZnCSY/6JqrKyWoKl6Izm5HqeawZ8e0vlWwvonnSe7fLhnMP3PQSeh7IokaQZkiTfzbJ0d7izXaz8gW48/5LZ3aKcW9e65BmffOzTu1/xwP1Pb/RbszBsdcCaFzaRtEiCv9bpsHeICltgRG4ShlATczox1GNh2+1rnkhRFMjyDFmeIAtSOC5NJqfPTqsTu8oB4JyTtKGuyV9NYhfjQFmUSNMccTzHZDxBPJsjSwsw4SPwQ0pJXA/N0RDUWEZqWwo5ycwJCa1lwznZsFU0XiOyEkB3XtcMCSp1ATUtURYlSkt7rzAYE4iABgUFgY+NDZpczxjpih4eHtJ8EGVBwLIqMY7HhzSyMJ8TRd2hxUCcGWIAO45TzVPt9XooSxpKPZ1OyVEISZEi6mqIPcZQAINGWRJhajAY4GCwh/FkjKLIIAQtWOrroApImmZGuJnORVkWWFtbQ6vVghSu+Y6jA5+bj3YbJ5ORUekiKngYUvNdUZRIkhRpmiCOqb/GttszBjBtVOwa2AqAihMTBG34fgDHkUu/r0HQ5cpe/RZWgb6uK+C6DkpV4nAxT/aT6Yvj6WQnreUC71opFrg7bfWrz+3PevvKS+l4Orsc58lBpyg6sCMBypojoUtKW2yUcVzN25YRXceB47kotYLvB2i3W8R7SBKjwJQjy3LkRYG8oAtOSpfCbdeB40hI4UBIbsJaEqCVUpi0xiL8RjkMpQH2AF1QuBsvFjQTdDZDkedUOjWhrRB0JxRCwvMCaEVOL89zDIdDlGUBpUp0Oi1IBjAmYGmUdE0RKGu7hi1Z0uo6OJ5Eq0VSivP5HHmaUyWJ/tL05ZAknh0qtLm5Cdd1Tcl1WlUQwOhv8jxHksSYjEYVNwEg+ruUrgGdXZCyFUMURThz5gzOnj0L13UxGo0qCnqVOnDSj7WRGkwqqlAiL3LMZ1McDAYYDEh/RGsN143guaTb6bguoIFExtCao8hzZHmGw8OBEfyl6KXVIkzHYiir5VR787EatvP5nKJVTqlWq9VGGIZ0jFPSCk3iGHmRk+yBOZ6MaQiQspfjOEssaFKZD+B57hIb+LhruGlNx0bUdCpvp3mOOE4PxpPJ0zcuv7yLlZvx3bK7XVU5EnWM5tPL0zh9oZUk96EkpElrmEFNy6zRprxaJZJSqqr+b2m81sEEQVhJ0dMdZYLplIhis1lSdT7aWSS2vZnmVlAOaoc2h2EIzw2hlFWjpr3QTEEXdPEtFgvMRkMazgyaphYFLbheAM8hcd6yoIqJEA58n9KJxWJm6OATADkKFaMdrRExy4SzHMJUbKxehQYgqr6KoijABF1k7XYbWmtM84npkjUpixEpchwHGxubOHv2LIIgqBZOkiT1BSsIp0nTGOPxEKPJCHFCPRaOQxUU3w/huj6IysBN2nMW58+fh+uSMC8tRuLicCEgjCivZURKIehYqhJJssB0NsXhcIDhYIj5Yk7VIMeD77ZMBMkhuIRgDIIJcO0gTRMkeWwcaA6tc5Rlga0thW63ZxrI+LGRB41jnFTpmdamXO4TzyIII2itIExVJA0ClCqvBKkZY3CkgARdmwp6SaQnDIkdaiPZZv/Kcc6iGX1QJUyaz6C0Ok5zzJLs+uF49vSLT3x21vjzu1ZRAe5uqnLc6/rG9atX77l44dG2v3ib5wRnYcqQtb5nrYTVFPlpVlia5jjOEuEmiqgU2+t1cXg4hOMMMJlMkGUxVT6KAiVKo5VZl34psKGTGIYhhfmKVbk14QykBp5lGebTKSajMebxwlQUfHOnCSCkR3iAaM7cKMGEBPPoM+N4TgN6JjnyIocqSDfD90PTpFYQf8Xk05wz5CqHNuXpQmUo4cMXHjzfQ4/1oEuNcUnYAIzKmB8EWF9fw5kzZ7G2tlZJMFI+bqM3bsJzEtkdDAZYLBYGFyH2YhhFcB2q2hBWEmBraxMXLpxHp9PBbDbDYLCH+Tyuuj8dSRqjVkxag6QIiyJHnC4wHo8wOKSZqovFwjj/gIYxywDCoY5aIUiasCgEyQ4KAIlGDALDKd2irmfOBbq9LhhIcQwgmrw9jpPJBIPBoCppKzAErm/ATxdCkEaHveYc1wHJ3lupBwHXc+BKF9qUmm2EVZYKQRAabZPj5xM3r2VrtlmSA3A8D+12G0EYmMpWVs7S+IXd/e0Xxge7BU52Fq95jANYBmyW/r349OOjN3/VWz7XCztXReRsCCFk03FY7sYqGr5cKq3xDtd1URRFVUXJsgzdLumSel6AMIwwGg0xnVJrc17kKEwJ1vogM+QGdu4HYRBAFBYIghB2pmepGNJ0gel0hvl0hvliXjmaVst2fToAE3AcD71eB57nYTabYDKdoMwJPCMuhwYYkGYx5vMp8gzI8wL9vkYYRnShg8hngnMUukSRkwTdbE74QbfXAxOA4ALtbhuuQ9HXeDxCoTWEFDhzZgtvfvOb4fsekiTGYjFHHKd1hcM47ixLMZ1OcDgcVMpgQpLqdxS14Lk+bJnT932cP38WDzzwgNm/KQaDA+zt7WI2WyCKWlhfXwfjdIyFFASQqhIw3zU4OMD+wR5GoyHSNKucRhjS9DemiIzV6fTRbUcAZ2YM5cDc2RnANBZKIc9LjMcTNG/o/f56hR3YdCJJkmp+ro22HCHge4HBbcRShEC/l8TZkAKu48ILXIS+D8lldcNSSoFxBkd4xGuRjkkV7XWsq22zIxns6/Yc0FAyajLsdrsIg4Ac3XQ2G4+nTz/9yT/cXVlfdw0YBV6ZqspyqnJ4UA5G0xe2+umVtl++VQghm6Fa8xGoCT0nhXuC1cy+NE0xHA7RarXQ75MCuJSEZbiui8VigaIggd3C0NQthmEbnmjgUArCF6ic6joEUuU5jSuYz0ivE0DVuUut/w44l/ACH91uF71uF4xR5FEWJXRpK0cajuMjhAA0sIgTqHyOkUUnqsiD7tIKmijHiwUmkxHG4xGkYwZTKUAyB76r4ZtBQgCNcrQEr06ngyxLMRyOMZ+TlF/N1FWGqzHE4fAAs9kERZkTF8ENEIUhHIca66TkaLVaOHv2DM6fP48oaiOOFxgcDrCzewM7O9TU1em0aX4L68H3QwhmiV+qarwbDgYYHw6RxDGE61QlT8dxwLiEKz20WiHOndvE+voGmFbY8z1orTCbTU01hIEzB2kaI8kSTKejKoISQtCQaOkChh8yGo0qDMZiEq5HZU/iyCyrd2mQc2ew2BcnBrDrQ3BKW0tdIityAo89D9KRgOBAqcB4g/Rlrl3CeIxj4gaUZwxcaygGuL6PdrcLN/CQxAlm83g4nk5f3L/6sqWZrzqJLzkwCrwyBLAmYKoB6J3LL22/4fyFy0qpudbat++xfSBN59HMA8nMUKUGEk1CvgJpmuLg4ADtdhutVhuOI+E4AoEXoGwp08Gpq3QoL/KKFap0Xl1c02mKNFUQIkYQBGCcIUtTIiZNpsjSFJzxahK8BQylJLByY2sT3W6X7uRphlYrhB14RCXZBDAdsKHfAhRDmicmPSC+RaejKpS/zHMjCjPCcDhAHMfgQgCaA8ypdDFbrRDtdhvkOAgMjaIQ+/v7pkoyphQNDIIxlJrA0NlsitHoENPpGHmeVUS7MCTKNDluchpbW1u499570el0EMdzDAaUauzt7WJwOEASk06HTSnFhgNIBgaNOE6wv7+H3e0bGE8myLKMaOStCFEUVXiT7/no9no4c4YIap12B2Wp4IcEPG5vb+PwcGiqDy6kI8FjjjSNMZvNsLOzCyu71+060GWtjTGdzlAUhME4joPQMF+b8g5VxIG6FG7pAZxxQJNKf5ZlFMXmOaR0jHJao/+GNS99G2HUS4GbErpN1+n6aaHdbsFKQ85m8+uz8fjaMevrroKkdxscPbYs++Izj02/8eu/7XpZlvOyLNcYY4y8fV5HHTYdMc6EMzPZm25c5k7AoFmdhy8WJNM2HB6S8E0UmYqGh6JQ0GUdsRSqgON6qAR/oCFlbEBPuitnWW6GLROQN1/MkSZUCrWRhlVid10H7XYPW2c20G4HKMoCw6HVqqASJmcCjnAwnUqkaUw5vyOB0AFLh4jTBGma02DiokSpSgS+jzIvMBwOMJ6MkGQxlC7BNJCkMZJkgSwLIKVAkhDfwXEkGLevxVgsUiRGNBhgcKQLDaAsYsznVJKdTMbI8hiccXi+izCM4Hmk6yqEg1YrwtbWWdxzz4XKEc7nC0ymI0zGY0wnU8TJwvToKBwcHBDLkjF0Ox3kaY7BYN/wRkbIs8x07AYIPB9SCHBJ4PLGxhrWN7pYW1uD5wkUJU0/63bblQatlE7VVOY4HlzHx2x+SKXxyaFZ8AKlGVU5GAyxvz/AYkGRYg2CR3DdRuNZ5TSoA5YzRhPmJX2n4AyMK2pvSBIzO4XSIcclSUBoTQ7BBBx1TxMDYyWdPxgJBMagmTIVGR+tVgu+7yPPCkwms9lsPnn04MalnePW0d20uw2ONp2H/VnPZxM1T7MrWZbuu4JfFAKQEkgzmg5GuptAoUkRnSkihQGaBGWo4FaVEaE5HNcFTxLE87lpaz40/QI+pCshcwGec2S5mQWiAQ0FZsYqcMbhwUMYRsgyEka2szDiOCb+RV7CkS7J9IWBkd5jcF0HvV4PW1tn0Ot1Eacx9g8OcLA/QJErRK0WOu02wohUxIXjYjxhxillkJwj4HSXsfwBIjiVSEMfRVFiOBnRmATG4fgOhJRwpAs/IFBWOtScVZYUWQnpYL7IoMqYGgIZwIUwdzgCieNkhtFoiPFkhDhOwZkDz3HheyF8j1B9xgTa7TbOnTuLixcvYG1tzdwJp4QTgMMRDqR04QiXVOdNyXl/MECJAvGih2QRY39/n9SwSgXhugj9gESYhIDj+Gi1I2xubOHs2S202hE4F8iyHGkaQ3CBVquNdjuElBfgukTIGg6HyLKCKmRSgwuJ+WyG0XgELhiSNIEUEtPZDOPJEHmRQ5gyahCECALfdKwaZwFAMmaU34gezzmqMQVEm7d9UTEKI9LjSAeSG3V0jYZ6vQa4vdnROeWaQ2gOxSUY11AowAVHFIXohCGE0pikabm/mD98bTz+4Gc++ntNmvlx+MZrHuM4zo6LPPTOYP/FM73waSnZVwR+0PM8gUWsoFFAgaPQHIVBt5lS4JoAKM0JFKuUvkA3CWKSuqbUOMfBwQFarRaCwCdJON9DUZbIigxNwVwmaD4tM+EodTNGiOMUi8Uc8/m8ioJ84aIVtQyxy63wl26XtCyiKMJsMcfBwRCDg0NKPRSHUnNoxdBuRwjCAEEYwnElxuMhJjMSJnaZB1LE4gbkTTEaJZjNJLQmSj1AVGQqG4bodro4c+YCWq0I8/mc5pyUVg6xzqk1o05cC/QXaoH5Yobh8BCHwwMs4gUYOHw3oMpQ4ENKF5yT07j33nvwhje8AUHgI0lSM92MBHw6nR44l8iyApxTuZi4IAmSJMbBfozpdGiIW5QGeV5oqg8S4HQnj6I2Lpw/jzNntkx6CDPciKolqiyxWMwN/uPjzJktqlpxhoP9AbRWCMPIVLE05gtyFGlGNPo8K5BlCTjjcF0HnU4H7XZkhIM5qdJDQ5sIgMJTuv4E55CccA4rZ2BL2lmWw5UOPOnBMfR7xpt6LzTKseRWflBBKAdCOcgF6aqUGpCeg36vh24YIo1jDCfT7Z3p5P2feehjn83SROF4B3FX8A3glemOPTZdufTMo9v3rPc+5QX+W/0w+lohPceRLvUiFAUYHJLmN5RvZWnEJxwexhg8z0VZBEiSBIPBIfr9PjqtFqTrQUoXnkfIelk0psUT0A+rru44RHJqtcJqkI7WGoFJTVqdNoLAbziNLuXhnQ6SJMHezg72BwPMZwsAGowDWRZjMlEoClo4URSh3+8Rd0RrzOYLKJ2bCIma2OI4RpnnWKQJuLCcFaeq4GxtncW9996PqNWiBrokNQ1kAKBMiL48YpNybIU4LjAYUHVhNlsAmsH3PXiBB9d3KoJXq9XCxYsXcfHiRXS7/ap3ZTabQ6nSaE1QXwag4PoeptMp5vM5OCdB5UUyxSKOAQgI4SDwQ4S+D8c0xzHGsb6+jrNnz+DixQvotFpIspSYvnkOrTS4IHGgZFGX3QPPx9bGJsq8QFmUGI7G0HlZEbgYZzTEazKvrhshHHNjCEwVLKiZucxoozSwNHv8LB5idWKoircg51kCXuBDOA64XFYdA+y1pSGZhOYgwgxjgGSQWqE0LOhWEKLX7UL6LoYHw2Jvf/Ds3o3th55/+OPzlfXziqQsdxscXX1uf9ZXXnwq2f/qtz4c9Trf2Gm17/EE23RdF1maIlUpGEwUUKedRuqPntsmOGsMgOu4QAhqPpqRQG+33UG3LyFNv4Hv+0vKY6icE30R5xy+5yMMW8SHAC3adruNbtSCH4bVYgzDEBcvXsTm5iaGwyFu3LiB3b09xFVbOt2dbKep7d1I0xTdbgdR1DKjHTnixcxoUwqEIWEzSRKD5wW4oIgq9AO0222sra/jvnvvw7333Yc4SbCzs4M0TcGApZkddPFyox9Rl//yLMNkTG3/Wuma8OZ5lWZoGEY4d+4c7rvvPsPTmGI8HmM6nVYlS9KO1fA8iTNnzsF1fdy4caMCqznnFR5Aoy6IGCcc4ktI6aLTaeO+++7FhQvnEQRB1fNRlqRZogFoO74AFIVMJmOUUYkoCEixjNEM3MNhCi4FWi1KcwQTmC3msHwYVzrodHqIorCKGMFYpeLGTerLGINWlL5agWHpUHpY5NQNS8zkgjQzQt/wTaxgsWWq1rOGJeNQnEExAsk5rHhyicB10IoC+L4HxYBJPJ8cTCdPXb300tUT1tZdTVOAV0gBDCd4yqee/Ozlta2tT6Wdztu90F8LHFfk0kEKEn3RjFWDAkttuj1LAp40A9gKx0YICelQOE8NU2McdkYIW21Ix63uODactpO1LFtTKWUAKw7fC6DadY+CbbN2HKrM+L6PtbU1OI6DyWSC69evY29vDwszVpEm0DXLxyXKktUcCUEzYFudDjRjkIIZ/Y4UUrrm4gM8jwY3eT6lSRsbG7jvvvtw5swZMKVMZ+bEUNIdQzpbdRy2UmBnkRKzkjMJ6XLDVPRNI5dXMUIvXLiAKIoqivxsNquqDHQa7UwSDd8P0O8TkYy0OVhVKSjLEo4QkK5rvp+a5Pr9Pi5cOIdz584iiqKKj2MHcjPGwUoFZcflCFpohQLiZAHNSrjSRa/fxTxeR6GUKbmj4sI4nl+BlY6URmrBX2KVVs7CHDMFTTR5IeB4LhzPBRcc4Ax5WWA6p1TNAqyuU8sB0iMdH2Z6hWzUAs6gOSAUh9BAoYj0FYU+Wq0QTGvESYI4z/fmSfL5F596dHzS2sHrNOKwthp5NF/X1y+/mN64sf3wWr/3uO86bwxct+96HngSg2VGSJiZN9sOUkaVFAAk8AtUdw6tNThj8DwPdt7scDjEWm+NmtuMhqe9q9Eds1jaKjtWwHEEIh4ZcWCSwmtKytk70WAwwHA4pInySUIT7wEUqqxEZgBiHVqeQFEUGI3GaLcLKr+1WpBCAkyATU1XKOfw/dAEVdSgtra2hvvuuxf33HMvGGPY2d3F7t5+RWaiSGi5mYyapmj3hKDF0G63sbGxAcZIM9NqahDW0MLm5gYuXryI9fV1FEVBkcaMopNm2dKG7nmeV8IzW1tb4JxV1QxLxbb9RZRSBuj3u7hw4aKJNDykaYbMEPTsirMjLMAZmK4xdsk5SlUgXihon8qaa/0+srQ0QjoEZpKgU0jXjukZsl2wdZNZUxXdRJ6ahJZtV6xVcM/NSAjLqm1FVEZ2HFld5laAiowcNZ0bZhyHpHSbKMngjCGKQrSiCEmRY7xY5NO0uDSJpy/vXbvU5G7cLE153YKjwDEAKQD9xEMfvXbm7LlPdsPom0M/7Pm+z7zYg84yMzxaGDC0pus22X1AQ+jYLFLLJrXl2cHoEH7Ygt/zTdrgIcvKxkyNWmau5pdxA+SR47Aq5raV2vYn2BQkN9UaLgSBY0qjRD2VzprtzqTFTvsSRRGCMDKLVxhKeEbjCDTg+h76/TXce+99OHv2HLKswGg0wu7uHmbzBWAWZXVnaxz2ZS4BVQ7CMMR9992HbreLwWCANM0gpYN2u1NhGq1Wyyh2TwytXkM2GLx2AVo5BMvJCMMQm5tb1EwodzEajZBlWdW+7vu+cUwXsLa2ASGpkpQkCVRR1DcJqzbPqGxJ8WYjNdU0OqNURhcVNCxqESdI4sTMIyFujVYKAhoK3GxzLZxjIwybUtruVCmJNGi7cwEgjheYTifIshSOI6umSmH6byhK0uAVONoQGOI1H4QJcqpCE3mxHYUIwhCz2RzjRTw4mE8fv3b18kvA0Ztt47W7inPcNcfx3/6VH9Dv/Pl/dATbwMrODgd7+fa1q49srPUf70etNzqOG0VBC0U6QZ5lYEyhbIwOaFLO7aKwalcWq7DNb2maVtoQvV4f/bWOqZy4JurgSFMGpWqKscUB7BQ4gO7U0KjmZSwWC5QlLV4r7FLl9FWIBNjGLhs1UC+FORhaVcCr1hph2ILneeh2e2CMYzIZY7GYgwuBfr+Pe++9F2fPngVjHLu7OwRszucAuGnQq+n5NzOlFDy3lur3/bDaj3PnzuHChQtYW19DnCQYTcZYzBfIy4LumLoW+rV3bRvyW+kAS2Ki40L7dnh4WJ2Tzc0t3HvvPdja2oKUHAtTQSqNrqvdD8U1GASYpkWmjGiSVYLnjIEJImMlaYL9wQF2d/YwGo1Q5Dm0VhBCwnEtQxbV39o0UNur0ZwfoFZGt5EG6YQy5Dl1V1vgNwzbRhLQMcfERhtoOA667Alj4oCpmjGtocoCjkspcOiTSl2idTGczZ7ZO9j91MMf/t39lXXTtLuestw1x0EzYekpTqahawDs8YcevHrx3vs+sdHqfmMnCr86ilosTVIUZYHcEsAM86upY2CdR6WUjuUTHwQBlbaGQ4xGh1hfX0MUUT6vlCbV8DSDUrmhntchuOV30MXFUJQF0jTFfD43HaAKjpORErXnmVTEOjbaxeUQmHphmvmvUpS2EAW6RLfbg+9H5mIsjUMJceHCRdx7730oywI7O7vY39+vyqGciSo9WY3EmqzbZuSR5yWUAjzPx9mzBLj6vo/zF87D93xMplOMRlZ71NzrmSVE1R3Ly9UDXUUeUkoEQYCtrS0AqF7r9Xp405u+AmfPnqVGt2SBLMtQGucAVs+3YYwZxXTQzpV2X1mVsnLGkecZDg4OcOnSJVy9uo3ZbF6lGLaT2Do3fsSpGnYrZ9U5I8KbWBoFSXyeBRaLOUpVIgppno3juBVr155TVJoa1Vkgh8o5NOMoOTOVPBKS7vV68AIfeVFgGieDw9n00y8898xTi8moWYJ9xaop1l5JcNQ+Hvk3HQ/Lne3rn1lvtR/1XPeiK52OHwSI8wKFme9xXL9ts8tQmXwRqO+8nuchy3MkcYy9/QO02x2cO3cOoaEuW2dge1ZI6Yub5rd6QSjGqon31plQbl9UrzFWl+zQWEy0bQx26BB9tgLnEpxL47AyxDEDYxN02gx+II1kHTWLra+tmTv3EAcH+xWAKKQ0s2Jrcd7jnEfzEYAZQFTAcWQ1vNvO4l0kMQ4PD4nWvgT4mYSgokxX31Adb5tGku4r8WHW19eNngnQ7baxsbEGx5FYLOZIswylkQ7kkhygYvUMYAYQB8VEMhbHoeNfYmFIZdeuXcH169cxHk9htVltBIiKLNg8Hssd1tpcipam7rpuVWEyHarUzZxmcB0XYdhCYG4WVtmsjliqLTffZxwtp9EMDAw552BSIjJDsBxH4HAyLYej4dO7e/ufePRD7x2ctFbwCjmQ43t9vwSmtcZ/8z/9zeNCrGP/PfrQR68MRqNPzRbzq6UqFXedCpC0n2ftuHBcq3rCWtUnIQQ8A2xNxmNsX7+G4fCQmriEQBQE1IkYhiYUV2AoAV1A66JxN7WAqVOJ0DYHXluJwizLakGixj9lxjZaMM46HqWMzgcEClVitphjOBlisUjguj42NzexubkJx3Gws7tLVZvFonIOnK2oo93mtUT6I7IafWhLuOPRGIfDQ6RpWlWTlnkgta1GHHZRA5S2EPs1RxCEOHfuHO6//15cvHgBADCZjpDlCawAD1WCLIjMG2pbdPdvDmkmh51hOp3ixo0beOmll3DlylWMx1NwboV0QtMd7VXt/EeuF63RpHhyI+BknYa9CeQ5NRfatn+ihHtgclWucPX41OmcdRySMUjNIDmDG/gIOi0ErQCZUtgfTvauHQwefPjjH3lkhfB1orP4H3/0n73+MA6mlvbppgApAD0e7BW7+7uf3eh0n/Qd95yQYs11vUrT0YbMunGCljoZG6Bps5vWdV2SwY9jDAYDdLtdtFsROp0eQjNuIM8yZGmKOI6rZjR7F2m28NvZojb8t6Cf1Z+0fA3HDIVanUjebGW30UGFUZh8Iy0KzOZzBL5vgNIJyrLA8JAWdF3VEVRxqube1iSvY8OzY6ya/WLAzjzPUTT23wok2erJqrOozjVbjTo0iiIHYxpSegZAZBWHJc2S6jiT/kUTlF4e32idmv1bmpo2qkYs0gS7GFrTue50Wuh0OgiCsMK9GGPVFbjsYOtjZUledpC5bcVfLBaYTqfIshxBEFT9SYKRiE8FRTfS59VjwhgzDXMMUBrClWi12whaEUowzBaJOhyOn9vd2f3ks5/52ALLDuJEUJSru+Y37p7jkMcPXrZn6ljA57knPntpa33z467nvqnT7rTcwHdZnoLlBVheAtzAY8dFHKhz/LIsl+5YBIbmyPMcg8HAsAY9tFotREGArN2qUpY4TkCpBK+6I60JxsFc1+hn1u38pG1aQqmENCvL0vA9TAmULwsv1/k0ofDNhVOWJdIshVYFiiJDksTIcxpTwFl9Zy9L6qbgwoEVU7bNVFW+3QD9li5os2/0OmifbcTAjs4iqZ6DHV0QjFX4jgEkDN4Ck/tnNDS51CiyFGmRUzv5ioiSUo0Wc+O0gNq5JUmC2XyK4eEI+/sHODg4wGg0Mg6bIwgitNsR2u1OJXFgmyU55w0ktNFpzSy3RcJxZKWn6rqkEh/HMcZjqqKQ6nmrwrOgrIOzl/Py9V4fm4bSOjQE44Ar0e114HjEtB0PRqPJaPLI848/8hyOcRArl/lJP31J7e5FHObxu/7y9+tf/6V/vFpdOS7ywPa1S+mll1/4sO/693tBeC7y/TNR4AuV0VwSrXTVcXgzswIq3EwEt+retiqyv7+PdrttQlLKWXu9wgj6FFUUwQFTYjNCPqZsBxN52ItiEc+RpRmUYtVd2+IIUjpwHReOUYWqIxk6FJVj0mb8JUhpvACgFIG3VQUDJufXdWS1TJNhR45wFaZXvyIvxSo9DgseGhC04eDs76kcLcwwotoBLZd+7XbQ/lnnAVCXL2c0XU2pEpzV09+1KauSgzUyg6Y8nqYpptMpDg8HGA7HGA6HJAodJ8jyzKigE5Gu1+ui3Wob9a3lSM86UoNGVXV3+zOltF6d3giOxYJa9ON4Ds4ler0+fN+n46HQqO/UlTjBGArj8HjjWFLJl1yL4wp4vo8w8MHAMBqNyr3h4bM7g4OPPvrxD44bB/Smacpf+bs/pdHkIH2J7ZUCR4Gj4deq82AA9Kc/9vs3ehtbH9hY674t4qzf8d2AZT6GSWFq9vUdY1UMVgPVBakISDB3WFZhElYFylYSSLMiADO05RosLc3U++VeDw3QXdGIwGhGNXrGGbKsQKkKsJKkAouygBA5iryAUzhoci2EIHBUa1IgF8y0Y4u6fFiWlPtzTkOcFaOWblOdBm2K6Ro2oxrpOChwbdmj9DNNjyZHQ2kCGqMNLU16OTJpPlpsppmSNBe/LYnT7+ocH6h5DYyRMBJjFmim3xeFgspL0xuUmR4XwhVGI5I6nExmmM9mSBIqYXNB+qVhRBokrXYLgReY7t/a+VTjL7j1HGYhaw1oDiEdRF4APwzhBwEYtKmizJGmiZm7G5kSs0Ops1Zg2kZMJv3UFHFJpiE0oBivbgLM/FyyEm7A0IoCeIyThMNkcbg9GX340w89+DBOdhhHHAjTS37kS253z3GIOjT4ru/5m/rX/9U/PInTsepR2SOffvDJ81tnPxL6/ht8L3rAD0ruJrmRvCuOVA6sreIJFptgYJBcEDfAOI+dnZ0K6Gy1WgjD0FQE8mrKV5aXAErY+aRW8o2ByGZCCMIiBIfgDhIRI02zZWWxQiFLM4hEVLgHAW+iEkyWUqAsZbXwlFJQnEJ4KUlyz4opq7KRcig7f8Yu5mWN1up9Zi4JszwMrBLp6rtmEydqHlcKkFYbuJarOE1uDZVnqQRdKkPjhuU42L8tDUCbIYkTzGczzCYTjKdTjKfUTJckNISpVDTIilJEU24PqZTcbrfg+T44zA3DaISarT+CzdhjIB2XlNSDoEpvyjKvCGlCcPR6XbRaERgTVQWN0jJQpY0xM2ieolHNTBQjBZRxtiWo61ZKgU4UoNWm6Hc0nabD2eyhnZ2dDz39mY81J9DfNNr4nv/rn9xkNPeXxu5ixHFsAeck0Gcp6ti/cTXd3tn+WCsKviYK233pemthFEDpEklSLi2KVTBqNcRmxnlog0m4roc0pajDdaln4ty5c+YCbNcNcEohLxaNaoi9aMURoNBxXNTycnRXynMSIS6LEhp24n1Z7bxSKeLYVhE4hHAMc1RWlQXrZISgKMGWIjln5p/FFoSJFk4CLrnBJ066S9XRheDLc2aazzmru0VXv4P2qVaqt05Fa41SKeRFVjll6hPKkWWJ0dtIkSVpBTanaYJFmiBe0LBp0l0VkI5bpX1+4BnJRhIHJjzKwhbNcjSq64Etvc4M05WiCcdxUCiqkGVZWvWh9Pt9OI6D+TxGlhWwerQk8WDa8U1ntQbABLFclY1ETHorJUfkeyadcjEaj4vBaPj09t7ub33wt37t6ZusiSOYhz56z/yS211zHHljkQDAn/3LP6Df9UsnMkmPRB0PffIPnm33eu/z/OhsJwy/NQrDMM9z5HmxtACBZQdSffhqSZTeCMd1UZQlijTB/sEBwDiEpO7ZwA/Q7nagUKLUBQqNijNBITdf6lWx1QxhBHK4kJCOC8dJkCQZeMZR8LoVHEBFTLM9K7ahi+jvdUXDlgetfqaQvGpgq0qlzIwOEEZRvQF6sko/YgXIFNzc+RulwuYdmdcVlebxBYjH0Xx/00E0/zVV55nWyMsCSZaZBrSi+j3R0KlJjplyt+96cD0fejpGEqeQkkFrpxriTDiEW+ERxOwEALYE7C5fZnYfLBiq4XmBiTQD+L4LAEjTvNqmMAwrHCzLMihVgPPSOGdu8COa7aE0CdVZLMrhzKSdAtDkLEMvQL/bRuj4yNNcH8zi3WuHow997rmnPzHY3c5vsh6WIo7/6e/9k7uboxi7a45DnewVj4s6jBhg7V2H+zvZY5/91Ec86d3jX7x4rt9uvynMMmFl/K3zaF4oxzmPVdVqS30uDVp/48YNCEdASIGtrS2EYYhOp0t3xZwWxmIxRz2Dtf7spX4EISEbE+gcx0VR+BUPIEmo4tLv93Hu3DmSh8vzar5JHKeVAI5V8tK67t5ljBnnIcAFN2AlPZKUHjeYxXKk0Nx3wlgECQmf8B7NsOQElvgzunY4Nrqww4is2rftPK6cZVmCNP3pc+zxt+zSIPARRS1EQVipnJe6xAsvfh7z+RxFYQBm10WrFaHT6VS8jhqjqWfCrl4TSyV10OK2FbVWq4XA98C1RpJRBassSxOFkHiyregQnkM9KbYdgRkUo3JJjEGY/VxqBhQcYeih2+lAaOBwMssHw+Hnru9u/+FH3/uuPdzaYdTYBs/xSthdcxxZdjQL+/a/+P36vf/2SIXFHhz7B7Znm73w9KOze+7/yo/1W92v8x3nQuC67dxoNqzSzu3zptXMzbrBCKBcM/A9qLJElqfY3dmp9B/PnNlEEATo9/vQmlICDRqgrMo6RSnL5nRxaxJCWMDQBSl30R2s2ctBIXIALiK0Oy2UZYE8U3XYniXVgGW7CJUuUU2U0wTgQetqXmydyzfStGNxoFoJ7Ljfg9dOwTqPyrHoo3/XJNw1QWsLBEvfR+DQ5DzP82hGS+gvTbtvtVoIgxCe6Q3Jihzj8Qg3tm9gPB7DTqKz4tB2gDWdY7u/JRgTS/tOUVEN+tr0ww6T9v0AkjOkcWwIfCkC30W314frOqQYl2XLOA4MIFrhXcQsrvRDOR0oAUCpAr7rwg8C9LpdeL6P6eEEu4fD3Rt7Bw8+/tnPPpWnqb3ubxltvJL2SlZVmrYaddjHIwfsuace/vyZja1Ph77ztd12+ys9z2M24rAXbPOOcuyXNUJqCvcFhAB8PwAAzGYz3LixDSnpYj9zZsvobdDU9bwg7Y40oWYswgGqrIr+XwLfABqRyKtqg73YkyTBaEQzS1vtyOh8dOA6gXkPQ1lmBgOgnN9KCcZJXDmUihhXEvW9KEqq5BSl0chQS87V/mxByZOOEXh9h7Z/L6QgjMQsUkuWsvtlI4jaMYSVYwhDiiLCdoTAt/T2Gsupjp+mMaCMMbAMaLfb6PV6JIeo1FKEYY973YlKl489J8uRB32+3U5SEW+bOSoSabLAdDFDnMRwHAfdbg+9Xrc67tqWrs0x5AYvY42eGm7AY86o2uZwkgxkTCMIAmxsbKDd6aAsNYbT2WJ7/+BDTz/9ufc//tEPTU647o+NNr7nR37yFXMid89xHHc3A/Dtf+lv6Pf+8k+tRh328ciB2778+XRn5+2f7ATB13muu+V5ft/3fUYpxKLKtZs592oEoq0sujGKPgRclyIGOy/1xs6NqrKxubkJz/NpsJD5vPF4bPQeSgihQaSSWtQGWGWH0qPtV7CLN01JMkBp4ox4ngfXCUw3pgcrvON5XtWqXpS2RFw2CGcldF4gL8vKcdC09XIpYlj+V4N51QloAsoVN6rGWqoSMqtl9Ow/u6CbdHzrSFzXhe86cDwHjukfkdKpCm4km0DiTEorMK2okuSIKiqww5O0XsZcbBQB1JWh+ubR7KAWYEyQmnoQmB6gCIxx5FlmxlwWCAIPa2traLfbFFEWBVKbohjHYB2XUspwfBjAjbgxN+xTzsEViSYHIckBbm2dRZGn2N/bK3f2Dx566dKlf/eB3/i3l25x7b9qog3g1RNxAEcPynEHjQHQH/uD336uHf2l3/ID/3yf82/xfT/SWjOaNF6Pi1yNOmzeS6XB0jAuCYwUgsp6rusiiiKiM0/nuHbtmsndFc6c2YDvUwdjXaacYLGIUZZ0kdNYSFqM1LhW71oTOARQ5eacMxRZgVlRYjadG9yh1n+wz5s9E3THdKqQmJn5HrBiN9AVDmOxhppnoYyjsZyP+o68mtIoexc1zqKar2sqLsTE9RpT5OsKkI1AliMDDTBqiSdAOEOWmd4dlLC8D1FtA4PgDFErQr/bx7a3XQ2HbqYg5gyDIo3lKKMqaSsN1xUmHQoRRVa8mrpq42SO3Ghr9Ptr6Pf7ABgmk0nVE2R7oJqko6qAbRoMhWBwhElXAEhB+rDdThc9oxI3nc1wdX/w4nPb27/xqz//T+6Es0HRxg//A43slfMjrwrH0Yg6mvH+iQetyDP13POPPdzttz/iSXFfp9O93/d9niQJq0VitClNroKlzVNtF3NZ4R22LMcYidvOZnNsb2+bfosU586dg+d5OHNms+plGA6HmE5mpBcKDcakuWDryAegoMviBU3BW845FOwFySteheV/2H0iLoFoVFJq5qnlblhQbtWazWEA4Hn6mIVXA4vVa7zGKZqlV854VY61M1nr94hqX5vHXCkFXRQooYxuavPy0yaK4PYncGakCQBEUYBurwfP88AYqvRrefsbwG2j0mO3XwiBMPARtiK0Wy0EAQkZZ1mK+Zw0Xl3fw1qvhVarA8aA2WyO6XRapylHKnbU9sA5iQwrBnDBICTANJ1LRwgjvtRHGIaYTqbY298f39jbe/+TTzzyoaUPu41I43t++B+84pHH3aOcn5CqnGAnhWz2ymLPP/XZ6T1v/OpPdfzg24Ig2nRdr9PpdDGbzVCWdBEehTnqBWy3aTnvX767ui6prM9nC2xf30ZZkkPa3KTJbOvr/caCFBiPp8izHEBWYRhlebRa0Yw4mkLCttLRTK1slGJBUfp7bqIbXv2NlfW35VouRFVmFcKQj5iGKpUpFdeRgOC8ilzstlRlVnG04mIdlKQvqKIEe8zLUqEsdaPKUiLLSESpyHIoaLiehzAKjeYnRSuODMC4idYsVqCJnxJ4QKsdIAx8OEICSkOXBaBKMKv1snLCWeNKsmXvdodSk8APAaaQmDk5aZbC8xys9dvotNvgXGI2m2EymVZyh/Y4rH6HhkYJQZUtziBttgoa4eEFEfr9LsJ2ByU09ofT/OqNvSeev3zptz/2vnftH3ON23/HOpA7W0pfGrtrjiOUN/+q7/juv6V/4xf/n9WyRPNgAjWAQHjHlRc+f6G39snQDx5wHDdqtdpCayBNqY179QAfrbbopcVg2+WBerKX7RJdLBa4ceNGtZgdx0Gr1cL6+kYVpmvNMJ1MkeeZCaWJ7ky/UxXKb7tMa42IevuY6VuxIJ9dfDbqyPOyqsjYNIDm4bpwHAHPqwVnrBMqSxrAVFVYrBYIM6lVyRspTx1hMMaA8viIgzFAcw6+ErWogubw5mYgNnWTTjAeT8ydmxroolaEtbU1rK+vo9frmA5WQZPRmGg4MUvO8hCFZmCSlECDQLcaBTQdNOccruciDEK02x20WpGJ9BjSNMdiMccijuG6LtbW1rC5sQ6tFabThdleak5dJbnVFygzGBQHl6Z5ERpaKZrIJj10OiQqLR2B4WCI/cFgZ29v70PPPPrQ8zjeOTSv+yVv+H0/8o9e8WgDuJsRR3kUuV+17/wf/qZ+x785QkW3UcYRz/vMY58cn1s/8/tS8PuElJHjuhcc12VhFFBFIc+PQZNoEpd1EhU+sPouc/FZQlFRFEiSFDu7O1U4fu7cGXQ6HXS73QqX8H0Po9GoCm21prxYMBuBUIhNYGLdIq4UqV3luoBSBZSqyW1FUSBLU2R5QaMrtb2emGGXuub7CeC1Yx+aeIh0JXzPM6Mc3SqF0JoBGtCcmrLUSji+6lCslaXCfDqteCbKaI2qskSel4hj4qqkRl5vHsem76eE0hp+4GMwOMTu7h663TY6nU5FwApDH74bwAtcuA6DlD5c1zfzbVoI/QBJbOUFjxcr0tCQDofvB4jCliFwtQyNXCGOE8TJDFleIAwDbGz00et1wTnHbEZOg0DYwuy/QBPspiuJ6ORacGhBc1IUAM00OFfwHRedbgfdXg9BEGA8W+BgOJreGAw+9cKVS3/45EOfmDeu89vCNnAXW+dvZnevrT6N7+Tttw2UfvhD737uP/0v/8J7lCv7QrJu2wvavSAAL3LMtUZa5BVLlGkNqWvAr2mr6YE1m7JwzpGkKbK0wI0bu8hzIjZduHAOnU4b3W4EKQHPo7vZeMwRxynKsoAqNEquaMp8SepX9p8dy1CWJYqSumiLPEeWpaQLkue02EqFUisoUxGyoRnHsnSflOJIhUMIAelItNotbKxvQooehEuRCjTd1bkgFSquTA+JiVYYZ1hNp0j4eY7dnV0MBgPE8QK5ma1blgp5liFNs4pKrsoS4AwcNGkNWmOWZ5hNpzjY24N0qeLQiiJzLDtmvGMbURQiNLoXSZqCgYE7AirXINFq40QNd0JDAxxwhAPPC9ButRrpkKTGuSxBEsfI8gxh6GNzcx0bGxsAqBQ/nS4auiQO9aQw0LR5ZQhehtPOwcAEIBiB0gocHBLS8dBphzi3sYlup4OiKDA4PCyv7O8+cunGtd/85Ic/YFvmV6OLVVyjev7Xf+jHNfLsTtbRl8xeFeBo0/7Cn/9f9L/79z9720ApADz/+Scf9cLwAQ/szc567y0tL2It30ehFDJdmhNPM1mY5uC6RMnqRmigTl9Ww/Wa7yHgeyFpYsQx9vcOUCqNLEtw/vw5rK31EYZ+hXdEUYDhcILZbIY0yVGqwuT+9l8OxmYg7QmNoixQFLlxIAVgO2qL0nQBs6phitkjwmCik7rcW5a8Gg9pUwutNc1LnUyhCwXfyAcw09MCRtwEbY424xxM1Hob9rNsJDKdTnH9+nVcu34dB/v71SzaZl8KfZjRv7AOjAtIAQjUlY5CKaiypJGVRoV+b8+rtDCo/8RHqxVBKYXB8BClLuFIcnxMMNLnY8SnsCMdgyBEFHYRhSFczwFnRmA4mSLLMwAler22SZW6EEIapzE3HbfMgNyAhoKAZdKasjQ0TRYEYUQCJLNQMgnH9RFGEdbWuuh3+2BMYzga4cb+/osvXr3yax/63d/+6NXLL6XHXM/HYRsNexWAG8bumuMopXPrNx1vtwRKrzz75PzeB97yeOB6jzuu80Yw6Xu+Bx8aaVlApykN+QVHYSZnrZ6Ck5mVtUAPydpRg1me59jb3UWSLAytusTmJpVrhZBGMTzAcOhhMpkRaSvNwDmVfrMswWSyqL67KAqUBXE5iMNg82oGZgFYIatGNqXograKX/ZzVkletoqTIUOakWKYrWb0+j2SUmyUS/kK7mIdD+e8ElLe3t7GpUuXsLe3h9lsBsZYo7NXVs5zqY+GEyDLoeEQsrtUKs6LAspEXzNDva8/y0EQkAxCmmYoixKuS5wWhrrHxnJH7ECpKIjgOC6UKpFlCeaLGfI8hpQeWq0OzpzZQKfTA2PEAZpMJkiSRVX1sipl3DpVY8KUtMEUJCQY01DIAXC4jkQU+Fhb72K92wMXDoaTIS7f2J+8fO36+z76gQ+8/6WnHk1PuKZPvEH+9R/88Xo48qvA7prjSFvRbb/3v/6rP6jf/c9/7DigtMlbXwJKB/vbV7r97qdGSfxNQoo396QgUKzwoYoCWV6AVcOplRGSWbZV53G0XFnLBWa5QJLEGB6OoMqyIoJRf0sAx+nANwQo3x9hNBxjNpujKAsDclIov8rotMrhTNvGNgnHdeC6HjzXh3QsA5X2o0nsss4CWE69rBhRnucYjUYVviOkgOh34Yp6YPZqZaXZizKZTHD16lVcvnwZBwcHiOO4quhYqji1o8uaJNbQHCH+B6pmO7utzf6WsiyRlQVUWaI0pLYizzHO4soR2cnydgIb59wcZ7/aBtdx4HAHCgppGmO+mCNNYziOxNpaH2fObKLVaqE00Y7FNABUA5Vs75E1SxtkBhtinEOCuqMV4+BSIAwC9LoR1nodeK6H8XSKazt72QvXrj/47Esv/s6jH//wKjv0ZnqiGgC+9//6SX33JHpuz+6a4+DizsKsP/u9P6Tf9TM/etuM0heeeGjUP3/PJx3XfRtP4vuF67htP0ArCgFoTCZTUiEXDKKJkjRsNeI4SiBjFd3ZVkDyPMd4TCXgPC+QJAkuXDhHF3AYwHWdKvoYDUeQrljSv7DqYnSMOBxBQ5gcTpUR6blwXQJAHUdUnAmqkBCpyf79cVR728diZ4DkWU5CzfI66XsqhV6fwLvVkquNtMqyxGg0wo0bN3D16tXKaQCo2KFRRA1nvu9Xf9/EXrhJJ8RKhcIec5vmVIxWTTNmiRWbIzdyBFI68DzCL3y/ZtJaQWLLVGUMyPKUWvIXCyhVot0mlfgzZzYRRZT6zGY09zVNU4MRkZiSPXZVhUebGz7TpizPTJMbgxIKjElIVyLqROj3+/BdgSSZY2800pd29h9/9uqVf/f+d/7akydcwzdNUWLfx6vN7h7G8YVHWbcDlCLPUv3cZx68Gv3JP/1BIcVb3dnsWx3GWS9qoxO2UBYKs/kMuaKhzlrXAjartPTVqMOaUlZDkxng0YHj5FjM51jM5rie5VUp9uzZLWrDNjJ2nk9VAT/wKeUw2qPz+RxZloEqJNKwRD24rgdHukbo2GIMtqTKDCOVHEgzyjjOcWit4LrUKj7HDFmeYTgc0kI1g40455X8YZNh20xPLl++jP39/SWnYXEIKqcGVQl4tcrRTA9XiVv2eK4yV5VSgNIoVIESREVv6pK4LqWErVaEMDSiwYJDmX6dJCXVLgDodDo4e5ZU4q1s5GKxQBynRlejdpTWcTBWE+y0tlqwCoBTbafWGgIcvkvDrfvdLvzAQ5pk2BtNcP3g4NKLOzvv/PgHfvdjhzvbxQnX74nRxvf8/Z9+VaUo1u6i47jznf+zf+0H9bt+billOQkoBQA9uHEtu/LCcw/d/+av+vdCoeVw8VbJJFqBh04rgobGLJ6TVqkyvRFLPI6jwrzN1nmgqbgtDN5AU9eShCoLBwcDpGmKyWSMs2e3sL6xgXarhzDwIY1Qsp2rGgZhxUqkz5ZgTMJxOIRwG7yJumHLOgs6FKTbKYRp3tb1LNemM1FKIwxNvi6A2XyONEkxGo0AoEoTtra2EEUR7FChNE0xHA5x/fp1bG9vYzAYIEmSKoVqmYoFAZi107B25Lg2Ftuqc2lWbupjzFCihMtdlFyAQZuSd91N6/seAt+DdBxQ93GOJE6QpQnAFFqGL9Lvd9Htdis9DRpxkFTAd9NZ1ttI0R09h0kPASGcKkVkjCQLO602Njc3ELVCpHmKwXiMS7sHB89dvfruxx57+P3PPPLQ/IRr9+ZO41Vqd89x3IIAdpu2mq4cab1/7qEHx2HY+qC8eE/Hg3al4m9mnCN0HURhBK0VFkls9EOxFDZba1YQVn+vNRq8D0UgoCMhpIM0nSPNEjNwOsZiMcdsNsfGRoxer48wDNDrdUw/TAvt9hiz6RSz2cx0typDWmJQSi71vQCoHFm9sGyvScOjNqpDaPxMCz0yGInAFNPKMVhsoSxLrK+vV5PiDw8Pq/RkPB5XoGETTwjDCL5vp7MfdRpLx5gti/00U5kloSANI7NnmLxSUvTlSDiOC98np2HJYIwBRZ4hzRJkaU4yjo5Ap93C5uYmNja20G4TxmZn3litDQuqAjVFXuv6UqOfyVnT+bByioSZCemi3Q5xpt9Hr91BWhYYDce4vLc3eubSlXc99vhjv/bBf/9vrq1ct8305MQUhb8KIw1rd48A5nxhX/Xf/sCP6Hf+ox8+CSg9lhj26B++dyf89u94n+yvS6Xm36U4/yrdbsN1BQnDKI1U1XNarYM4KcRuGrE6xdJdU2sN15VwZAue7yLPUuR5gZ2dPYzHMxweTnDu3DmcPXsWnQ5xExyHVKviTqeiNs/mM+Smz0Yp2dglWUUcy0JE9XYSZFMfJrtYrWAOcTUccFHfzefzuYmOJobglmAymaDT6SDLMuzu0nhJovGXFTBsNVktnkDfZSff2eOGxjY2Tp8pKVfxUyO9IsV1oNAl4SGcQzoSruPBM6I+dqKa45g+FqWRpSmSmCbBQWt0ul0aXrXVR6fdNaMpSIBpPl+YeTT1TcG2B9QAs4kwtIYuywoOYxxEwFNUspacI2qF2NzaQq/VRpHnGIzGuLp7MH728tX3PPW5J//t7/zSv3jxmGv0ltHG//zj//TV6zVwNx3HH8F7/rm/8X/r3/ypv3vbQCkA9shH3nfl7f/Bf/buYvN8Wkznf0Ex/tZ+J4TnuGi3qEFrsagbl5p3QGvHRSPN1Ibu/EQ55lyDSQdSSzhSIssJ71gsYqTpDUwmUxweDnH27Bmsra0jigJ0Om20ohYiA6RGsxDz+Zx0LlNiYAoDvDFoqIrF2NwebkL6msnYPEqMm26KhnO06YgQArPZzDTzzaq830YcJBtAx8hxHERRVDkNx3HhuGbWjFG9orGW9MVK2ciNnEq10Zru3Eyjak9vnkjbNCekhOcTn8P3rJNyjMOQUKpAlpGIcJYkULpEEFDnMk2820K3F4IxhniRYjZbII7nyDKaCUwaLLpyGtZ5kfMgXooqAIDBug6l6XcaGsKwhNc21tHptAHFMBrPceXGwey5q9ff9+Tnnvk37/pXP/vMCdfoiQ4DePU7DeBVSAC7hd0OUMoA6Hg+Kz/1gXddfduf+FPv2rr/Kxd6xv8SOL5h3Sg9UbWBUHsAR7AMAEupigXJLDgKWN6Rfa2+0woZwPMDqFIjTmLMZlPs7u5hOBxhPJ7gnnsW2NxcR7fbox6MKCTx2ijEbDbHZDIhMVwzmgEGAGVlHenYFEUDhhiGCvCttp8pw1+pw24LRNKYyxpDieMF0jTB/n6K4ZDSGRtlECYToNPpIIoiSg9AmqMV2ctUmex3EUmKVdvD7Jmx3BRuGujM65xCEVPapTTE6oi6LrE+bSWJhmkliBcLpFkMaI4wDHHu7BlcvOcCNjc34HkeirI06eIMi0WCorCjQFe7cperUdpWdiQR47jlwxjODGcanuui0++j0+uiBHA4neLqwf78+WvX3vf408/9wnt+6Z9/7oTr82YpyqveYVh7zTiORtRxK6B06eA/8fHfP3hgPvtt8VVfW6IsPUfja3iHRGf7/T6msymylGi8zQvo2KoAE0uvWYGd1VyeMRIG1o6ZdC4l0iRFXuQGKyhweDhAv99Hr9erQDvXJbwgigIsFjEWsaFGmwa3wgy1rjU97JCBpWSg3o9qSvoynd46EKuAJQSD57lIEhrnUHfvcsPPiAyW4cNxZAV0QtfpkbDM1mpkwfKkLGadCyMylTJzVjhnVZXEcz04ngvfKIfZ5kEGjdLM282yFFmWkhQCV2hHHfT6PWxsrGFtrY+1dcKSlNJI56SpYhXils9pU2ipPueU9pUoc+q+VYz6d7TW4NrOHw7Q7XfQ6XbBtMZwMsb1nf3kuSuXPvD405/7hXf9y59+3EgArjqM13yKYu014ziOsZPSlVrUwaynlx/75MQX8gMPvPkt/clYfzdT6r52pwXf84EIiEVcEaSWUPVqOR4V8aV/NvynlMCqXTMuwJgEZxxSuggCKv8VaYpZMsdsNkWSUNfoaHSIfr9f3c2JE0GchLbR4IjjpBpMlGW2t6VAXhYoSwskAswIzWhQC711Gs19WhVrpgVqSVUBSAyJ6PGOY8udraWJ73TXrUczMGKtQYBDc11FInY0pmYkxgP792AQklK6ShnMAK7SccEdSaMRoZCXJco8Q1GkRtVMA1zBD1y0Wx2s9QnPWFvvIwho6hrR33OzH/XNwKaWMPoZSmsQvajWJ2VMQ2kG7jKoXCLLaDqcZhxMAJFHkVenEwHQGI+G2N3ZLp+5evWDn3ny6X/5O7/4Lx/N0mQVj1uNNl6zKYq115TjOCbqAOoTYo1j2akwAHjm4Y8eBq3Wu8T5+0XJ5V9SKB9Q7RK+50M4LcSLGIA2FyfoLsS0+bijjsM+2iYwSlW4aeTiQNV8Rp8heAD4HtzQQ54nFbFpb28fBwcDBEGIfr+L9fUN9Ps9RFHb3OlDZBl1yqapyemtsE+WIs/yqhGOHIZR99Zl4yAZgR/eTLVqgpbW1FZPSutFFZU4Tr2w7Xut5CFDXV614mPMxD8KpMvBuKj0OrhptBOS0g6rbmblEAn0pHIuteWTQDNFahmYKuE4ElGrhW6vjX5/Dev9NaMX6sF1JWhYt7kIuIDru/AySlm0ygiYZY2mPW1SJoqXaEUrRUPrmQYTGkJQR7MQDJ4fYG1tDUHY0mmWstF4ght7B+lLV699+Jlnnv7n7/mFf/loPJ0c5xhuFn0Ay9fza8JeU44DuG2gtFlxscYe+cj7dmbf+B/+yhu+5mtzJ06+h0t1HxNA4AZotSNIKTBPEqR5jqwsIDWDADVlWYVzoMnloFyfaU4y+IxB0M0XjBkdSs4Bbl7jAo4boCy9iidhHcFiQQN+JpMF9vYG6Hbb6Ha7FRszCHwoFRnRYqt+ThhImmbIiwxlXkDlGllZoCwKFKbNHQooUaJURbUPNkwHACiaPMeEgBBOtY+UShyd1lYTunTVKWrlBDU4pOE2cCFongsz1RHXNdohHjzPhRASnufCck3SNDE6HgnyIkVRZpDCRRg4aIU9mjzfJj5Gt9uj6pQrsIRha1DVgwkIz4cXaWRlDqBEmRdookCcMxOa2v8ZOT3GoHVphKg1HA/oBB7CqAXHlciKnO1NJri2t3/48pXrH3risef+9bt/9V8/fIzTUCvPTxTneS1FG8Br0HE07DigdJXX0UxbAIA9//CDQ7fd+q3W/Q8EZVJ8Z4rFm7ohQ6/VQq/XgTN3MJ/PsEhs2F9CSwp/awBNg4Yi258UlCkfagCaW4qnkfTjJOQDzSE4A82+ZgiCsCYtJTGm0xkGgwF2dnYRBB76/R7OnDmDjY0NtFqt6i5txynYsZJZRtFLkefI0sLoeOZV63+Z58hVCYUS0DUQXA+GMloTMECn2T+LnKziPdxGWeYo130p0vxb1hy1PSu1OLGtjlDqUJZ55TCSJEaapxAc8H0P3W4Xm+vr2FhfR6fXRRRR45qUvKrKaBiFQ1u4MYGHKzh44IEVEWalRg6Goiyrrl/blN+8lBSjfqGyLFCgABcCoR+g223DdT2MxjPcGIxxfTjcfeHSld955PHHfvX9v/yLTy1mx0YaxzmMI6Doa81pAK9Rx3GTlMU+Nh3IEefxuT98727n2//cb54/ezHNS/2dZaneKhlDNwwQhT5cQaMb4ySlZquyhGKAx+iK1Kqk+aDWMTQB0ibl2rZ7GxYiM+Cg5Y+R85ENCrWHOI6N+HGGyWSCNE0xGAyqkZS2L6RW+ZLwfQHAI+Q/L5bEiW0DmUI9drIelkQaqUqZoqqqr+smR6XJqCV2qK6ATdrN2jmQQHOd1qyCpDQys0SSZLDjHJUqoTWVw8MwxHq0hlZEVPJ2u41+r2twFrfSTK1SElQ47ZFbCQfgSIkwaEGVCgsAOsuglS1DmY9iTUCZhKk1SjiuB89zEAY0u2U+T3A4GGF7e+fg8zeu/85jTzz5y+//t7/07GI2PSk9uZnDeM05i6a9Jh3HMdY8Ec00xT4/4jw+88HfufbWb/tP3nH2/jeN8hJ/kenRN+syR6/dhutLdGQIxxGIFynyknL6AoUpG5KeJ80joWanpf4WBihOw3hsqsManabV+xRQmju273uVXD9NC1sYYJSAW9KKmCIMwwpEtWQo6tGgbRIQRrHdSgGYTlRdK4tblXOSNzSLRmlTPWjOxq0Pb82etHgOAxSrcZ6qWs2q0jCtSDR6PFQ1OMoyNBnTcBwOR7rwfBftdgv9tR467TZarRBBEFZKaXW6VJ9tI7WyZBX5zHgU3+EogwBZRoCyZo3tA6AMN0PD7rvVX/HgBz4c6WI8X2Bv/xBXd/ZvPHv1+u8+88xTv/z+X/nXN3MaJ0YYTXstRhvAa9hxrEQdq9HHcRHHkvPIsxSPfuS9B18V/0fvfeArvmqhM7Gts/yP5Xm+0WqFIoxCdJwWPNfFYpGhyAokKkWpCWTUlRo5fd5xnalM14Bkk2a9RGkXvIE7AFJIw8r0kOfZUru5UgrzOfESmrqiNoURnMNZShEkXCkhHAkhBalvCw7GJRynWdYlwhZwtC3fWrP1n54A0HXIbx2DdUDN6KZ5XBgDPFtyNZUU29Xq+0Qnj1ohfN+t9tE6Mm2cEGNHncVJpqHBzHgCz/OQFwUyVatoNRmjNJMF8FwHru/DkRJKaxxOptjbHxSXr9947oXLV973+NNPvueDv/Erz82PB0KPiziOjTZeq04DeA07DuDElMWadR4VFoZjIo9nH/rDUTKd/N79b3n7taQsnpjr7Fs2VPmVJXA+CltuEARwhKS264wRJbwsiU0oBGmJWqUGA/JRTUVDCQau6eIFjnJDKlq4MnUPU6GQQgKgix1AlXrYFny7GK3sYJ7nFSmMsiMS/eWCxHPs1HvJ67EKAK8XHzclWgZAcXAmTHnZ3OEbB7FaaEoDmlURTIUWLDlQKlmTFqqEEC48Ty61vzcjJ8JARDUBzqYQyw2IunIktzQzPQ2MQUqOIAhRKoVC5cizApwJo5auKu6JIwU8R4JJhrjIMZzG2BuMxpe2dz7+zOdffOejn3jwY499/MPDhtOovg3HO4nXndMAXuOOA7gt52EdBnCC87j0zCOL6eHu4/d/9duvp1tnH85z/bZ5XnzzelF+3Xqne6HdCnkr9OHECaYzYlgyDehSo1QFIBxwbhyEUNCagylaxForoGJo1hwQazZkZqbyoqHNTNoaZ7AYiNXMAFBFILY6Q+MTiN9BLMdy6YjYGShaq8ppWcEd4j7QdnBmZP6FoKFLQpK4EGpcQGtdYwo2DWmUOoXgFYhLmIyPIIiq6MLzHNM/wgwOk5sOYau3QRokS4rqxxDzViUQlsw4bMt/o3mzEkXpUyczcqgyBwOHAJWjPceB50owDsziFDdGU3XtYPDy5WvbH/z808+++/97xy8/vnvtSlZ/Q/W4Glm8rioox9lr3nEAXxznMdi9ng92r9/wg2jvzH1f8eibvubtnymz7D9DUfwXotN6cxgEotPuQAgHceIiT0lQWJUKDAWF7aAJZJoxImDRUJU69GHcNFeZDVWGOCZMidDooNJiWG75X+6PWW6fd123oQSWV1PamukCtG6kPcWSA6uiCYNP1JUQYstybisnDji381tqZS8pnIqabtXbbWpgI4pmaqUUkKZ5Fb3YCIoxBca4IW0ZIJnZ9KQuB1cn7Wb5isFbrINjDOACkILBkS4Ey1AoBck5HJe2XQpBQsvxAvvTaXlt//CZZ69e/fXPPPLw+37/V/71lTxbGghtH2/mNF4XFZTj7HXhOIAvjvMAgCSel5effXxx/cVnHn77t/3Jaw+84Y27Sdb7L7fW+m9ptd2u9FweCo5UJGCCIU9tN6sGMRB5NWZA26pCVZnQgJEvZGYriIB0HMW92SNTLxjbCm77aJrkLArjyyVaej0UibgdtvTZXLBNBbFmzw49LaE1r7afc0o9rFygjYaIzOXCdf0qorA6pM0KjZ2yVzuLZaUwikKYSYMaJ+Y2MY0lM+zWZjexIzlcR5DWqrbzUFwwx0Ec5zgczzAYjbO90fDp565d/X//v3f++rsf/dgfzLDsLJpA/Jed0wBeR44D+KI4D8AE5EWe4eEHP7CzmP+xd6k3f/WNNM3+dG+eflu73T3nhaEMo4iHQYgizbBIE+RZVi1GAJCG01Eymkhm832S+7N9LcTaPB6IXFYlW9UDrXaqqWNRRSVNNavaGdBktNw4lWW5vqZOBlBXY1YFdup5t/VzG23YaXLWSdgRlidte9Nh2L+xKvBKAVwBbFnm447suItASBpaVZYlRYcayJTGbDzFeDRV+4eD0bWDg89cvX79Xe/73d/6wOOfenCOo07jOAzjpunJ681eV44D+IKdB8PR6EMDwDMPf2r4zMOfeu8f/9N/7oX7L164slmqb2sp9RWdINgMXE8KIcGkRO6Qinhe5gAHSgJBwJWGATvAtABUvbCAJpioK37Eqq1GI6vPl53H8hhLQWyzaqQiUOtXrkYYTc6G/RxrTUfS1LE4IkZsAd+GQ7L9MbaF3T5fdZg2alKqRFFkkLK5rctyArdl2pxIReUY25xHlSUafpXmDOPFXO8Px6Pdg/3nru3s/t5jTz/1vg/86i+8FE8n5fKn3bbTWAVOX1fRBvA6dBwA8B1/40f0b/zUEfEfa8c5D/v66qVZfcYn3vebz4v//L/6DVWo7cUi/vq00/6afrvzxnbU6gZByIIgYFmWYBHHyLK8SkeU1jbmr1IMWkjkJCyfockFOe7ufJw12/7NK+b/5SiC2fLvKpdEAw4XKPSyBqjlV9iFbLe9GR0ATSxEHHEqdvtXBZJWweHm69aZpmmKNHUMR0XCFlEa1Is7NioXE/emLAmfmkxnGC/SYm80vnLtxu4nL199+fc/9eCDH//Uh947Qn3tnBRt3I7TeN2lKNZel44DAP78//7j+t//5P9xu85jNeJoWoUdfvQD73n5G771P5xcuOe+Z+fJ2tvTJPnmNM++vhW0LvqB7/lRC0EQYZGmSLIESZpC5SRlx82dX2hNzFPNVxaaPsK01KD0olpo7ISqjPmlZgwQgIQlXhnuCADFSdEcQD1s2nwON/mA5ZPUC5SB5AlXNUEtE9a2pNc+1+7XccAu/S3tGQGhsgHQ2u9XKIoMaZoiCANopk3kcOcew3xV9bdFlmI6nWE4GWE0neu9w8nixnD85NUbu+/93DNP/97vveNXL00GB81JBM1U4ziHsYplHHEaf+Un/qmGwuvOXreOAwD++x/4Uf2r/+iHbsd52KuSrfxrGgOARz794OCRT+Pwa97+jZ+/5w1f/fDm1vk/eabb/lPdfvctm+1eKwoDeK5AnHAsmMZCK+SlIrxDqSrkFkxDQMOsC2g780UVlFIwXonfVJUWzUx5lyo0YGYXDCGKgUGXgOb1YtGaCFkoS4o8KB4hZ2FA2GbjW+2UjgoK24XfjI5qJyEMBf1kp2EjmBo7Ma9VO0qPeVEgy3NkeQkhJaTgje2BcYp2m+zWNkzbh4LA4pKhSHOM5jMcHA5xY/9gsXM4fnF3OP745y9f+tDjH/2DRz79Bx+crHzMcanJSY6i+Vq1Bd/7939KvzoGNn7x7XXtOADgO7/3h/U7fuZHbuY8bLRhn7PGazB/13QiDIB+6vGHx089/vDjb/7ab37pm77hWy6lefJn1CL+hna7ven7vsOEEK0ghOv6SMrCDFw2U9rAiWuutVn89BUMHIob7QpTDdDWYYA6dRVDxZvgrKx2i7ADQe9SgF7tajUbrlCSfoYGIADONKC5AW5p12tlM3JMq07CHiJbBanHCHAcPVyNA2cWPmfNqEqBSPmWPk4l67woEMcLCC4hfAbB7Y3bRlPHfL79TENKy/MEcTZHPC8wnc1xMF3keweHB1d3Dj52ZXv7vZ/59Cc/8ZH3vOOwcZ5XH+/EYSz9/Xf/6D/ReD2GGsZe944DAL7r+/6u/vV/9n+vOg97hR8Xbaw6klWrrtHnn/zM9MqLT//2n/hTf+aZzY1z39TrLL51rd366m6rfW8QRh3HEVJIwOfM9IeUJEFXlFAaKLnFJWhgMhcCJTiYMAtf0UIWTKM0qYrQgpyJaU5j3IIA9R24GXFwTtqg0CW0YvR+pqEVQ2nwFkqbjmIS1Q4fAy40040mz8R+76qROBInMpky26oZNKtcAhhTxLbNSuSLFDlLIIUP5slqnxir97MecQEznKog2YEkQZLmmM8XGIxn2B8NBjuHkyev7e999Pnnnv39d/38zz6bpelq1WPVCZzEAr1p9eSv/sTP6ax4vcYaZF8WjgMAvut7f1j/+q0jj5Mcyc3SF50s5uWH3vPrz529eP/Lb/v6P/bI9OyFt/e6i2/utdpf2/a9rwh92fb9AFbHM8ty5GmGrCigoaA0oJVGqTWMwgckIzapMHdnaiXRJlBgS1tgow2w5dkwTSNwUFMapClhuV1bBTZvBnYuf+eKFCPTYFqjZDTEyBq3DsH8zziDVgpJlkIKAelJSJfDqUrMtePgINZrWSpkeYY4STCdTDGdTTGZ5eVkOpscTMYvbO/tf/qlq1f/8PNPPf7Uh9/9zgMcdRj28XYijZs4jX/2ugNCj7MvG8cBAP/d9/89/Wv/+P88yXncLAJZTV+aVkUfO9cuZTvXLj3jh63nvuVPfvsnL5x/4BvOdNv/+UbH/eNpnm0Gvi896SLwHLiSQ+YpspwiEKP8QRGC0kBJE9I5V9AQ9RdVq8a8l7iehIPYTVllV1aLd3m3l0R5jgFdTyoD16/Zz2zCREYU55gqDAOHEjSMWpntoYNuRJRBTE+qOgFMa6gyhy5zMy5CVN/bXLNJmiKOE8zmMUbTOaazKcaTyWz3MHnm2sHBg9e3r378cw9/5qmPvffdq2lJ84Oaz09yFsdhGbXT+Kl/qvH6DjQq+7JyHADw3/3tv69/7Sf+To0A1o/NlbEagZyEgzStckjJYqYe/N13XL7nga/c+bpv/OMvTNa6T4Rh65s7rehNvW77fBSGbSkkXOaCcYWiLKijVINavqEo7TAOxG4d4yQEBKiKEam0iSIqrOPoIrelSMIl6o21DNVVQPOmPSBLn3vUwdjUiHzVinq4JgfJdYmmyDJnVJIuOCc1Nc7BHQbHkRCeYyj5dmaLrnQ8NIiJOh5PMZhMMJxMi9F4Pp5Mx1f2h5PPvHR998PPPf7ok7//zl/dWznfzed3AoIei2f8tR/7GR36GvPXMaaxal92jgMA/vzf+nEtlMKv/OSxFZdm5HG76csR8BQArr78XHr15eeePHfPA8+99eu/9cPrm1tf113MvqUXRV8fRdE9oetEUkgppIAnHDAQ5pDpElIbsV+lYLTwjL4EbwAZzHw7N2VTAXvHb3aT2l1kIDYrh4KArKKUpdXUIIE1XzuuBFxVNBodrEBpSGWiqtY0o46C2WiCqPkQzDTTkYKYFNIM6iapABrIRLR6S59PUtIjjbMMizjG/sEwOxhPDw+mk+f3B6PP7u/c+PRTTz7xxAff+WsHjXOKleerDuB2ulqPpCbf/WM/9WWRmqzal6XjsPYd3/+j+jf+8Q+tRh9Ns05kNdo4ifPRtMqB3Lj6cnbj6svPnrvn/pceeOvXf3LrzLm39budP9Zvtb6+E/hvDP2wH7qcCUGt70wxCKYqcR7FNARjpgdGwQ5FBqORBAoUVTCT7wPNsQiNTeVGndw4i2peKnCEbt4cDL3KdG1S4ZuT3Zu/o4cGjmGZpQCkGR8huISQ1E1LfS8OXMeB49JAaVJE1yiVQp6RrECapZjGc4wnU0zn82w8m1/bOzh8emd/+MiNw8HDn//ck89/+LeOdRj259vFM26ZmnzfT/6MXmRfJrnJin1ZOw4A+LP/29/T0Azv+uljpQitU1lNUejGfXvgqf0s3Lh6Kbtx9dJl6bhXvuU//tOPnz1/4W1r7c63tlqtt3Rc/6znOF3P89qOdFwmhXA4Z1I6JHZsgnutFAqzwLXZEq0LaAiqSMBwPcAaEYfdmEbFhJmuXZPuaDN3pOkkbJWk+fNRZ8KqaKAJmArBUE99J4q5dAQcIeA5DqSgObDSEZDCheNasWTiiFh2Z5rnSLIccZIhXiz0bD5Px/PJbDia7B2OJk/sDQ8/cfX61Seff+LJq5/+8AfGzeO9ci5vlZrcKsqoPvev/8RP6xxf3vZl7zis/YW//iNaqRy/9tNHyrbA0fTlOLzjOAeij/kZRZ7hEx94z5XO2sb213zTn3js/LkLbwrD4N7Q8y+2o9abQum9IfSdLd+RLTcIPMeRcKSA5BJCAtKAnCVDTS1nVGYVmsBSjeOwjhpzoCjDOCDopYpMs6muCaCuamIwRt+92q/SbHqT0q06aR0p4QsOT7qQjgPHdM5qoy5clCSwHOcJsqyk51mK6WKB4Ww2HY9HV0eT8fMH4/Ezg8HhU9euXH7mI+/97e2DnW3L9jzuvFW7exv/TuJlVJ/7N37y57UqE3y526njWLHv+Gt/S2vh4TeP8j6adpLTWG0cuakDmRweFJ/8vfdc2zp/z97ZC/c+2ulvtLrrZza77fY9UeDfHwb+vaHvXQx8/1wUBFuB50W+4zjSkVJwUlUXwvTDcAYGMxC5mgdTD1+yMn/WAZRag4v6d8s4RY1jWGu28gPkPKSkUZHWUdjpa1YHlVrraeCT6/r0PsYgmAAXgFacxjtkNGc3TjPM0wSTxQJpkWd5Xsyni8VgNJld3ZuMn93b331s9/qVZ3Yvv7T72Y9/bDw6PLBNaLdyGM3nt4thLEUZ3/cP/4UOIFHoLx8A9GZ26jhOsO/8X/4P/Y6f/fE7AU+PA1Cb71/9W/sz9ravZnvbVzMAIwDXADx6/v43ug+86S3rZy5cvK/X6b6hHba+Jgq8N3qOPOd7/obrym7k+a7jOExIAcnMuETHCgdzQC87Dm4cg1ZGE4SjcihA3Y+ySgJrdsbaVnrXcSjNqBTaLZhJgjjSaKDW/TgcSmskeYGyTFGUJdIkJbJWVpC6e5qViyyfj5L5/jieXpqOZy9Op5PPDw/HL7z00vMvfuIDv7M3Huyvdqyunhv7eCdYxk2jjO/7x/9co/mtp3bqOG5m3/nX/rZ+x8/9xO2Ap7fCPprvXX3edE5VbrF96cVs+9KLN3obm/sX733jUxsX7/nYWrd3oeWHF6Io+opWEH1VGAZbgee1Qt9d932/L6V0HEdX802a3al2S7gw8oCG8akZgapNKcEjTWqcZphwg0F4VTQhIIV1FoRjCMaASktVochzapPPCyR5jiTLkGQF4jRBskiQJlkyydO92WxxZZZm23GWXzmcjV/c3919abKzvXv96uXpy888tdjbub7afLZ6Huzj7aYnNwM+q8//Oz/3/+pZujjm1H9526njuIV951/9Aa0Zx2/83E/eDDxt2s2wj5v93ernMwAYHewXo4P9KR751BTAlY2ts84b3/yW9sUL993XarV7npQRj8KzgR++MfTci4HD16Xn9j3Xa7lSulIKRwjhOo50hONwz3HgCgHmcLiOA8Zp6poQEtKMfJQGs7AgKuc0nU2Z59w4E8YVSp2jSIuqOgMGqFKjKEvkea6TLMuLoijyPC/SNC1meTmeJ+nufDE/WCTpNEninXwxf3EwHF0ZTsaHB3v7o0c+/uHBwfaSo2ge89Xnxz1+If+WPv97f+oXdF9yHLcRp3bqOG7b/uL/+oOaaeCX/9mP3Wn6cqcOBDjqROxrONjbyQ/2dg4/DRw6jsvCMOTrZ887mxfujzqdXqsThp2g1dqIougBPwzOO0K0HSlboeec7YTBGwI3uOhJDs+V8D0PDnfAXQEpBFwhoST9s5J/lqyRNxioNKO27rMpipLmvWqNXJU6yfJFlpWHaZq+NF0k1xd5Fud5kRZpMRrE8UvXt689V0xGk3QR54P9vXT38ovJ9WtXctM7smo3iy7s4xfqNFb/Hn/np39RF9JHnMQnnJpTA04dxx3bd/+vP6h/8ad/7KT05U4diD7m+aod910MAPI80+NxVo7Ho/Kl555OAAzsG776bd/w0JlzF9qBHziOlFK2O51Wt3c+8sMLvutu+p7XCXyvLZmMpNQed6TrCRk6Ural67SE40hOU2EYqqGKFFBorZOCYQrOp9A6K6GyLC8GcZbtL9J0lKTZdLZY7E4Oh9fno+GwTJOyKAo1HBzEn3/2qdnOlUu3qmae5Cyaz78YDmPps7//p3/+OMd1asfYqeP4Auwvf+/f1tAKv/Sz/+CkysvtOhDgeEdyEh6Cxu+x8tqSPfPEI/NnnnhkvvLy42tbZ2W3vy5a3TV34/w93fbaWs/3Zdt1nMBx3cjxvDOu425JKTwAXDImGWNCM8aElIIzpnVZ7mVZcS3N80NVFMk8nh/uXL22M9i9MZ+Ph/lsPtN7V6/kWZrc7kK8VaTxxYoyjvss/NDP/CsNx8M8PS2z3q6x49qf/0gfeBs9Dq9DW13Yq4+34zRWXzvus272/Gbb9Gqym11wd4phrP58Rw7jFtvyurIv9jo/jTi+OGbPyp1EILjFazjh8WbRCFZ+d5LdDadyqyv1dtOR1cdbYRWnDuMu2Knj+OLanTgQ4NZOY/X57aQyJ2ElwO05lS+23Qng2Xx+J2nJ6u+O+5yTtuXUvgA7dRxfGrtdB3KSI7nV89VHvfLa6s+r33szu5No5E6jitXXvhipCY55frPvObUvgp06ji+t3cqB2PccV1n5UjmQWzmP1e1c/dvbsS+mw2g+vx1Hceow7oKdOo67Y8c5kONSDODWjuOk3+EOnusTfnezbb+VfSHOovn8Vk7hZr+/2fNT+xLYqeO4u3ZSRHDSe28WhRz3eKvXVp8f9/Mfxe4EuzjutS/08aTvP7UvkZ06jlfGVu/4q4tpFfjUK++7Xedwp9HIH8W+UKdx3O/v5G+P+/nUvsR26jheeTsubbgZoNp8fhKG8oU6jC/EifxRU5Qv5PlJ33tqd8lOHcery44DJm8VjTT/7rifb4Zn3KpseyfbetLrtxOJ3M7vbvadp3aX7dRxvLrtVtHIrQDWm2EqN6v0NP/mVtt1O7+/HSdwu47o1F4Fduo4Xjt2Upn0VmlN8z03K60ex/n4QrftVr+70/ef2qvMTh3Ha9dOWmB34lBu9nm3+76b2Z1GJqf2GrFTx/H6sy/EodzJ53whduogXmd26ji+fOx2Fu8Xq6pyaq9z+6K31Z/aqZ3a699uZyLZqZ3aqZ3akp06jlM7tVO7Yzt1HKd2aqd2x3bqOE7t1E7tju3UcZzaqZ3aHdup4zi1Uzu1O7b/Hz/gNsjwsdv6AAAAAElFTkSuQmCC46bheGmPgxb8QRmaZT9fzRBdL8Nx0GvLXr9pKG6wcdNw3Fhj2UK6VmNSf8+VSGDPxZB8KQv+ppF4GYybhuPGH8/FmNT/5iAD8XwX8LX+/U1DcQOPm4bj5TkOWpQvFN38hfyMm+NFGDcNxytrXOtC/lKyKjfHK2g877L6m+PmuDleeeNK3dhvjpvj5rg5lo6bhuPmuDlujuc8/n9JmYRYTTIeDgAAAABJRU5ErkJggg==";


    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}

async function loadDiscountIcon() {
    const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAABHNCSVQICAgIfAhkiAAABMJJREFUeF7t2k1IFFEcAPC3im4lfqwa9oF9WbSFn+kSePHSRclW8KAIQR66eSgkT+p2EBTBgyCUJhhGQkGwZSR0TBAiUegDkQ6BGyT5mZK12td708wyjTNv3pt5Hx1mYXBxZ97M+83///5v3q4PeC9FwOc5/BXwINRI8CA8iH8HBS8ivIjwIsK0UHqp8b+kxvOJ8Zr1tfX7xedCVcFg8LWseY3UiJgYj9bEYgvjOzvbSdnZOduFpRWhoqIiKRjSIPQIWhTIxJACoUfIyd0Pai7WgWdPo2BleQkgjJPBwuJQKDQvMk2EQxgR6uobgN/vB/F4HEQfPVAwAlmB+KmzxSUiMYRCWCFod14mhjAIHML09DSoqKhQPGRhCIHAIQwODoKhoSHQ0tICmpubpWFwhyBB0FKjtbUVNDU1ScHgCkGDIBuDG4QTBJkYXCDcIMjCYA7BAkEGBlMIlgiiMZhB4BAikQhYXFx0PGMuKCgAbW1tXKsJEwieCJoebwzXECQIaObo9oVmnjwxXEHYjQkzMzNK/1lBoLaqqqq4TLocQ9ghoGmz9vxgB7EJ73a6TdTo2+IxA3UEgUMYGRkBAwMDSiSQQMRutIHlhgZwAMIdHBq0zCBjW6wxqCFwCGNjY6Cvry/RGTsIDUE7AIdh1hZLDCoIGgS7iDAi2GFYoXZ2doJwOOy6tBJD0CLgIKwQcBhWED6fD3R0dLjGIIJwgmAG8Rv+86M6JtiVU2Oa4NKMBQYJRNLDsdGVpaXPWejiL1+5CtIzMpR+zM/PJ0qZWceMF79SWwsWIjftDBKfn7h+DWROThIPvNFoFOTn5yv7b25sgHt37yjv848ej12qqz8G3/6yOrkdBPo8GZ6gfGtz7cXa6kpqLlx1DqsLrqhR4wCpP5ERgiYi8oaHwaHbtxLN0UbEY7gQvAwXgrPgQnCyP+18Y2PjO9jYDzcQKfDgff39/eW5gfSJ9bXVFFIMq4tnOUagjhkHTD3Ch9inC+3t7W/gbt/gtgM3dD92vYgiAh61F25p3d3dpUcO5z0hxcDdRVZVw1hCNYTMrMD227n31T09PSgSvsLtu5uIQHJJcENRsQdFBsQoscLQT6bQgaLnESYIc/AyttRoQGnheIzQQogYQ1uVJoFA+7CaWWIQUCSglLBEQNdhlxr6XKLGsIsIrfEvlZUgc2rKLHUT/8M9a7hFoIWgShMUGSKePlkgOIGgwtBWpuyePrGhoH5oth7BCsEphCMMks7i9jEuyrBEcAMhFIM3glsIKgx9NaGJDoJ5glYiiaqD1blpqoZVG9TVhBRCFAKLiHA1z8CBiERgCcE0TUQjsIZggiEDgQeEKwxZCLwgHGHIROAJQYUxOzsLysrKlLET/YaK9WSJpEqxKJ+48xCXVpkIvCOCqrTKigTtInlHBBFGNfzl7QT85S1aY9StLDGZMZKkhaiIsMXQdpCFIBoCO4DKRJABsQujt7e35MzpgtGXr2Ybu7q6hKaDPm1EjRHGVNVXE7RCngw3tLiKniBdPUWSjgnG/WRB6CMjVYX4Cf9uw812odVpZ3HHyYTQMFA0oOtAX7wgDOxqMw8EWWMELipNv4Xi1fn/YYwQ0Teqc8hODaqL5bmzB6HqehAqxB+FYp+Om/KfFAAAAABJRU5ErkJggg=="

    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}

async function loadTaskIcon() {
    const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAAECxJREFUaEPtmglwG+d1x9/u4lrcB8ETBAmSIimKoi4epmhdkWNJlirJqnzWdqK6auupMk3iOKnTTsczbu02deN40sijxknr2rIlx5ZsSdYRWfdFShQpiuIhEQQBCiIJEgQBEPex2/kWWGoFgiREmuo08c5gSHAX3+7v+7/v/977QAz+yA7sj4wXvgH+Q1f8G4W/UXgWZqAMQABlZdDe3h6aheEnHfL/IqRxg05XThAEYbRYWgCAepDQDxy4NCdHQxPkKhyniTAPO2k0Gof+kIF5Jbm5Cx9b8dLjPILH+/zEzn05VvPV0wCRBwX9IBXGCjMytHPnLF370lM//wGf4Ane2fP9f2/rvXrYbDbbAIB+ENAPApi5xxIAnje/qG7bpteeXVG59RkMw4jzzV/s/c3+1z4MmdrPGwFYA5tV8NkGZsfH9en6vIXzajdv3/zG8zlaQwUABgPDve2/3f/371/tPHmwp6+vGwCicZVnDfpBAGNFmZkaiSJj1YubXt9SXf7oYwK+UIbAwpGQt7nj5LH39v/0d8PDd071DA4iA0Ow/y+B0WRiOp1OKCGEtXULNq3ctvm17RJSloH+zirpC4zaPz7y1m9P1n/81Sjlv2C1WoOzCT1bCrPjEgadrqwop2LV955+5wVdZtEiBOv3+4EGGsSkGHHT/UM913fuffnDG9amExaLpXU2Q/vrAubFCwi2iEDj8nQ6XV6WImvVi5v/ed2SslXrCZwniEQi0NRyBSLRCFQtfgj4PD5QVDTUfPPskV9/+ndH7K47p0x37vRALFWxoY0DAHrNOH19HcA8vV6vF0VwQTTqd0RtNrcZIFyYnZ1NEIKlT6/9yap1D3/nSaGAVNE0DQO2PrhQfxaiVBTqHloBOVk6wDAMguHA6PFLu/d+eOjNE6Gwt948MHA7H4AfyMyUkTiuxnE82m21mmcK/XUA48XZ+cVlc+o26jPKyH57l8nuHBh0+QeVyxdtqdyyesdzUrGCWbeBQAAamxvAZO4CBJ+vL4TqJbVAkiSzpH3BUfvnp3Z+eOLy3gaVONOhVqZrddrSAstAW+h695kvu2/fbp9pKfp1ADMFRe2irc9tXLZjO4/gi9xe+50w5R/N15XO0SgyDYABTlEUdPd0MeHs9/sYQJGIhIXzl0BxUSngOI7WNe10DVpM1s5OPgilcmlaNkXT0UPnfvXrE5d3775tt/fP1MFnAjz2WR2AqKxm46bvbnj9Va1SX45hABIpSQuEAhwD9A7A6RqBk2d/D263656CSiaVwYqHvw1pmjTWuOlgMEz5PH6MpinM7uzr/K9D//DmtYbP99kAYjMVO6aVuqYLzP0c+h2vnFu5ctv6N35YYqh6VCImCaFIOPZkHu8o1F++ANa+3qTVY1amDmqr60AuU4ydDwZD4PMGqK7ephPvHXjlF40djb+PhzMX9L6hZwrMuHFBVlamRKKq2b75Z09Xlq3eKCJFyLVj69Lvg5YbTWDsvgnRKFtI3ctN4AQUFMxhwlsiloydDASC0ebOU4d37v/RR173MDKyvgT3fiDA7CShn4ROq8sXi4SLN6x4sXpd3Xc3qRWZBRiyXQAIhULQfL0RurpvQiQSnrQ3IAgeFBqKYMnCahAKRWPhPeIatBy79MGB/SffrY9SwavxlIVmjoW9L+jpKDxWQfFpujhdrat5rG575arqrZukIkUaMihGWZ8Xrrddg1vGTpRnJ4VlT2IYDkWs0hJpfKHStM/vGT7fvO/Q/tO76m3uvivRaLRjuhXZdIBxVBsTQsn8PF3ZgidWf3/V/MLa5QIBKWdLRveoC260t4DJbARUaCQeOE4wl1LU+HM8ggd5eQaYX7YIFHIFk6NRVRYKB90dpoazvzv+9hnz7faWUNDd0m2zDSdZ15NO7n0BLwHgu9P1uTJNWlXNvHUVG5a/uCFDoy/FcUKA7hKlKHA6HXClqR4Gh2xJlSVwHuRpywFB99iuQ5QaH+ooRaVp0qFqUQ2oNVogcCZo0Hhhu7Pv1sEz7x1quH64xeEZaBRZrZb2u63llJGUKjCvMCNDTZKqstKimsrVNc88NL+obrlYJEW5BENFhD/gB7PFBDc6roPP50l6YwSbrSmGOdlLAIWvsa8JrPYOiCZRGg0gJiVQNnc+GPQFIBZLGLXR2g2GfI7WrovnTl3Zc6nNXN84GvK19fT0OFADNhXxVMB4aU6OisaFhrKi2orlix9fVpJfWalRZhn4PAGq/LFgKAj9tj7oMRthwNYPwWAg6T0RYIbSAEVZi0FKKplrvAEXdPc3w8BIN1B08r08gUAImemZYMgvguxMHQiFTLqjw5Gwf2TU1nPT1Nh0tmnfuVbzhWuUz2c2DgywYZ78OSaaEbSV6tfpSgU4v3jL6h1VKyqfWK+WZxhQJcXIw7hwkCkVe629EAz6mXIx+YGBUpIBFfkrQSyUsUox1/tDHmjrPQfD7jvMWk12IGURqC5bD1WLa1loJsojkUjA6RnsPdf02eFPjr3dQEfhJkUSnUajEbWZ446JFMaKiooEEA7PwzGsuDSvJve59a8+lpNetFAoIGU4xrgO88C2wX5oaW0Cu8POpJ7x0BjIxRpYYFgFUpGKeYDYdAGwonoCLmg1nwKnl+3/7z4ngkVGptFooaJ8EWRlZI9NGEVT0XAo4LkzZLrx0dGfHWjtPnc7Go124UJhq9FoRFtG42ZwQuC44+IGg0GDB6lCuUJd+K2qp5ZUz1tTmZNeOFcslCqR0ggwEAyApdcEJnM32IcHAdXN7CEjNVCSUwNp8hzmQXEegMoAgKZsuBsAeRYawzHaD53WenD77WOfRealVqWBIb8QDHmFQIrIGCwNlD/kcQ0M9XReuXHs6vGGPY0jvqHuKIZ1WywWNACbp1MCZvJs/K5M2ZgBIMCzstLEhKAsS2soW139VHntgg3LtMocAxYPbwSJ6uXOW21Mk4CqKrFADmX6paCR6wDHcEZZVT5A9kIAZLx9LTFopDQLfaP3HPiCLiAIgoGcWzIPVEoN01zE44K2Owcsl64fOvdVwyetd2y3OryRYBvYbIO2mFuj2eYWJfdAJ1OYC8w23iiEcRkAKU1Ly5OQkgUlhsqCx1fuWFpe9FA1nyeUxB0UwpEwU0aaunsgWzkXslQFsSWPAcizAHSLARjPwgD8boC+JgCXFQHHl4jTDNaRG5Bn0ENx4VwQCJiMx0xIJBLytvdcbvz81Lvn23rqezwef6s35DWNjo7646BIWRaY3RubFJirLKMu54WgUY3MV0ulWlKqmJetyS1Zu/SFeSsr/3SlSp6eycYiKjZcDh+EXSLAogIGTqIByK0GEKsh3j/FIAMugN4rAJ74zjSNh4Gn8INCTQKfzx8Lb6fHbjvT+NmZoxffb+sf6u30eFxtDo8HLXqkKqpgECgLzIVm5osdKFHhZMCMuqhujgMzP0UiESmXy4sVpKyipnxd/p+t+9E6rTpXf9fQAAIeCkYHAIRSHPKXAkjYDjDBO70OAMtFgICbArTFJ5LhdyeFoqhh14B1z7G3Dp9rPtAz6ne3jrjdN4PBIGoVESiCRK9EaO7u530Bs7AIlAuNfhekKZX5EpF43vySZQV//if/uDYvq7QUu7vgIOijQJmLgdrAdsbjUwVS2mGmwdlLg1DMrlUUARRttRlv/feB1w83dZw0eQOhNrvTjva7UIHBwnKhuSqnBMxkjYRXIvA4aLVMlqlUqhf+xcY31y9ftOlRUkzy2DWNRhMpY9A8YfKkEAnS4LxNQ8CJjwUf4/6BYPRC88ETu/b/5KDD5bw2MjqC2kPWmJIBs+6cuI7HZjkV02LawCRhzYKjCeGVG8rr/nLLv/3V3PyapWIxiYtI4Vi+xHAaSA2ASo9y8L23pCkanFYA3xBy69g5BtYfAr/fT9+yNDa8+9kP/7PV1HqaE7ZcVRPDGSnL5sVxm/pT5WF0/3ucOg7PhjcDLQQgaxc/snb7prf+Nl2lL2BUJQVRMUkSbHgjaHkuDdI0bAwagXmHaXD1YkBH47AURfn8/mjAHyIwAGzI1WfZte+Vdy41HfkyGNviSYRljYprWFyjmjItsWGdGN5saI8LcYlEkr6+9tknNz7811ujkUjENtJr84ZGRueXLC3Oz5pbgsf6QeCLKVDoYyaGjpCXAqcFIOyLvadpirpt6+pqbj/fIRbKJenK3EwBnxQdPL/r06MX/+cTp9eLNvFYk2J/Jlu3E24OTNY8cB2bqzRXcZSmeOkqVXGhrmK1TKLCnO5Bx7Crzx2JRmQLSpcVvrT1XzZnaHLzmGSEAYi1FCh1saFdd2jwDqLKKfbe7uy37vr01X1NHae7cIx2a2Q5cpUqU+3xOcHUd+N0/9BQR4JZIbCUlJ0oLSVa6FTQCFig0WgMfAyT+H0+d8Dn8wYBwiqZLEsikS16pObJ8hfW/3SzQpaWgYhxPg2qAoRPg8OEARWKNfijHsfQB4f/9YvjF3e3ur2+a06P0yoE4JFisYSUSGQ0RQUGhodNAICaAi4kUpi7Zu/JuxMBjc8V9/7lnlIz7uLcdYx6Nq7y6Bw/TanMVcrV1c+seaVy/bJt6FtD5sskoSJmokEXE+kQigT9Ry9+cOSjL9+8MuxyXRl2DVviqYcbtuhDLCz7d9agUt7fmqof5mInQnPXNFI6MV0x77VabUmuNq/qb55465FFpSvqmMliR4o9Jt1qvNiw85OXvzL3Gy/b7Hb07QJbRCQWFhNVVJOqmgxiKoUTlwC37LzHsRNcHBcKhSK1Ql1VUVBT8fJ3fvW0RpGVy+5qom8aRlyDff/x8Q/2Xuk4fc3uclwOosb6bpnIraK4ZsWGccrKprqGk00EtzBJTFms0mzeRu9xhVicptFoH3p2zY+Xr617fo1YJGO2PPxBr/tEw97j7x/8p9N2h63e5fMNJoFNVjZOWFhMpdz9hHQylROVTlaVxUJbqcybk1/xrR1P/XxDSd7ihSi0u29fb/3lnpe/aDddOzPsYgwJlYzcdcuGdEqNwVSw6Px0gNnPTbamx1VmQgBhekZ21dZv71izdfX3tuAEj0D/trT76NvHhpxDDcHYZhirZmIxkdgFsWv2vjbhZwrM/XxiK5m0/lYqlemGDMOyH29773k+T8B/4zfb3u/u6zrrcrkGEmAT3XmiNfvAgBNh2fcIlIXnrmPW2IQ5aWnzqyvWLuPhPPxC65HzDputJRBLN4klIxvGE6We+4adicLJTI8Nce6mAdNYcJ1bJZVqFTLFUsCBcPl850dGRpBRcR2YTT2sqolFRcopaCLHTWWtT3UN1wtYhbldFheal6PJKKMJmugbHET/wJKsGUhs89j7T0vVmeThVMGTbQ+xYY2LxWJmo8rn87G9bbJGIHEzbqp7p3R+ui492eCTuTcb7txai9sATOTGKcGkctFsAE/k3rGvDGM1NxeYVZK745hs3abCM+U1swXMzdVsZZaoLnddstDTrqCmJI1fMJvAyaC5ZSnXbZOBztigZtOlJ5rgZP10smtT7mdTVXKqB5rpOKma2GTX3XfnM52H/l9b0P+XVCOrmQAAAABJRU5ErkJggg=="

    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}

async function loadAvatarIcon() {
    const url = "data:image/png;base64,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"

    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}

async function loadTransformerIcon() {
    const url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAIABJREFUeF7tm3d4W/W5x98zdXS0rWXJQ5b33llObGdA2hRSIAkk7AKXQssspEAu5RaaC5RRaNgjtJCGESghCYSQQUKGk5gkjh3HdrwtT9mSbO15pHOfc2L16qrO7m37B3oePdYjH1nnfM73/b7j9zMCPzzOSgD5gc/ZCfwA6BwK+QHQD4AuzUR+UNAPCvpBQZdG4AcFXRq/f0cP4s4Jm7ysCACwk6+jPy/tii/w0/9ugNCiuRXZmUUlixFCgAd9XudYf9/YSF9738CwuQMmwDUJ7J8G698FEHceeFKuylgwa8FH0xcsKUBJEsERJIJhaNDtcXraG/YN97ed+Ghi2PJh94luS4yyLlATF3b4vxoQospRidPS8zOVas1CXUbObRlFM3NwjAQMQ/kriUoFwVCwjQ2FT9TteHDbO+vfAoDwPwPSvxIQAlqgq2qvuLdoxtx7tElGlVAoppgwgzAhBnAcAwzDAEExQBAEIhEWAn4fHN/71R+2vLH2CQDw/zO86V8BiPtOQqSGBL0xa356ZfUzicnZhtS0DMBQHFobvweCogDDCQizEZYkBUDTIpAqVCCkRMjJo7uajn275bHuvu4DYAEfAHBGzj3iryX6/oXFVNzR/0xA3HchqjyVtqBk2i/S88uuTc0t1QFCSMbHLGgo6AebeQgMGbmg1ScDcKoJM2wwEEQ8fi9rtZjB53YjtFTKCkl83NTW8MVwf/+fxUqNx6hTEzQpMKK4oIgW0dljlqHX/vT0K3X/iBD8/wSEF1QXZHtcNm9fo7mfO1lZqkyuS8t8fM7iG+7JzC6gRLQIWJaFjo4WwFAMMEIAKo0GhAIhL4i/+RDL8sd5Az4YGjCB22GHtJw8GBrocVAkESlJNxKzcnNFyWoN4nA5wp9/vfnOh27/5XoAYC4V0v8HID4jFc0tumLWFdc/0dl8eLBzd90vBwdtlqTi1GqZNnOdWKXXF5SWQl5BCbhcLjCPmcEf9APLMIChKKAoBiiKAEUJQS5TgDJBDQSBgy/gB8uYGUxd7cCZdjgcgtScAlCptFCUooMFudkwbrexH3/+8f2//sVD7wJAMCZiLqo0uFRA3OfRzMxM3CuTYdkpKaQXQTQSCTYvt2LG01JlivLod9+EPBMDb3Z83/ScWCm/U6TNeBwlaEKTrAeBkISA18OyKB5mWSRC4AiL4xjnyZw7oxhBnj4/BAGFXAmAorxR55dVsrSQRlg2Aqcaj4JEqQVWQEF+kg7mZqWyGzd++NtV9616EQACl1poXhSg2St+qjcYjEWJSo1Op1bJ9SqNHMcxkTcQ1Nb1Dear1Np0sTRB3nL0MCKTK1jrYNdI0/5tqx2jjiaFIe1ZgVQ9Rygi3SwT7mD8nkEmFB6PsBEPwrJhAkUFqICQYCShJQWkgaQkqQKJnEJxEuGymlAkAZwSg0QkAqMxExg2DOahAXB7fZCQlAIpMpptrvvmjbW/+8NjALyJc8q56Gr8QgHxRnvzY3ff8vPrb/3vnJRsGYbhOEngaJAJI9ua29CeCTvadbIRQSIsYDgGJE5A58mGiGvcZGn6dm+NXKNMFgqE1cEI2hCY8Iz53X5fCAkxEOQvgg9PFmcxHKOEQjEhFcqEqVKF5EfK1IwasSpZgWAExgIGOEFCUUkFSBUKYFgWrGOjMDZqhrT8Ajh1cHvLFy+8OgcAPJNZLgrpgsPsQgBFj8WuumvF0nvuvOOtmpJaOYacLuiO9Q3CV00noLe1CZhgEJSaJN4jhEIR2G3mSMvBrXVHvqq7YfKuEhwIiYQUq+VSsSZJJZZIaIVIRFOhUJBxuXyegQGza3DQ7g6FQiEujGmFIDk1x7hIkWz8sUCemIZgBM6dUHpWPqSmZ/P1knVsBJwuB/jdVufBTetWmI6b9sWEWTTtXxCk8wUUexxWfe2i2bfftvzjJbVLdAJSCN2jY7DhSAP0trdAwOWGnKJKPiuNmgchzIbZ7qZDfd3H6lb1NfXt5mBqtWLt7Fn586aV59XqVHiahAatWEQLRSIpyoQD4A2A1xuSWHtNw+11Bxu+b2ruO9LbaxknCMClarlBY0y5RpGSuZgQKRQJKg2SV1QBQqEYGIaB4aE+CAb9HKSjx3Zuua+rvu14TDaLDbfzqo8uFBAnF7SopiL3xp8v37zssqVGWqiGDQePQO/IEIz2dEJGbgkIBELgDbS1ge1u2HvcYup529xu3okgfubyyysvX1BTdkdxrq5YJsZEjGcEQREAFkEARRBggfsKBGh5BgSCDOv1ujym4fH+g0dNuz//4tsvR0Y8AwRNiPUZmsWG8tkPSFVJUolEBmkZ+SAQ0OD3+6CrrREIAgu5bCOfNO/e8aipzcT1bhc1GTgfQNFj+IzFPdNKc/U3/WLFZ3Onz6rEKQO742QHcupoHah1KZCoT+ONZMQ8GDm2Y8PhrqNHfmM3uzspiiKWLalYuvSn81dlJpOKoM+BOK0WEEvFQAgICIWCwJFiWQAMA5Aos0AsTwXLQDP4XcMQwaXhg03jjZ/+ddfLDU0jJ1AyosiuKv29Lqt0GoaRuEyhgfTsIsAwAvx+L7Q2HAKZXOZvPbTjV8d3Hv5gMuVfcJidLyDenKOAlMnJqp89vOK9zKycH437VdDR1QnjI0NQNL0GSEIAbo+DbTy0s+Pk7m+eMHeZ6xMTxZIlV1Zev2Bu0UNZqQphmAkAAggwIT84xoYAFYjhZNtwxO0NMmGGwcU0iSgS5Ig+JRMk4giIaQKcNjMwLA7tJvvo4Bjy2b7DzccbW03+jLLS2xQpGdW4QCRQ61Ih2ZAF9nErOBw2iIQjrN3c2d92ZN/yvmN9DTEN7nn70IUC4gZZqEgkki+599pn/YjsVoE8BRnpaIGSOfNBKlbwFFtOHPY27Nr4fNfx1o8BgeDtK2avuOmaqkc0CQKF3+MGiqbA6fTB8cZuCAUD0GmyDpxot3wcCkZsOApCkiRypXLBjGSNOE2noJCUVDUUF6UAihEwYXGCSCYPOIP4xJ66FtMnm4/sFKUY52nT86twkkbSsgpAIleBdWwIXC47G/BORFoP7/5Nx77mVydVFJ0CnBekCwHEw+GnfSKQZpWXP6PLKv5ZWmYe4rJZYFrtjyDo84PX64rs2rh2z6m9+1d5naHRwtzE9Pt+PvfNqkpjbijgBTaCwoTdFd6zr3XYNGAd9wYj4WNd9pdMXdaomfKpnmtoM7ITFpRka5YlK8g8rZKWzq7KQBLT8mHANAYCxAUSuRzqW8b3Pf3qlxsMZdMfFqtTjKRQhJBiBVBCijW1nACz6cSgzzL6VFpBWVk4FLAdOrzneRgF7/lOAs4XEO893ImnFKYUyNTJxZhYeENp7ZXzHSNDSGpWHshkarCPj0Fnc72r8dvN95s7Lfu5k7jtxspf//zm2v9gGQZD2SAMjbqYrTtO7Pru+751A6O+boKEsNcRsk/eXSR3VkneeL/VPDY05OS+T6EQavIz5LUGveTG/HRl3swZGUhicgqYBy1AEATY/Uz/E89ve8iN4QXJBeUrQ2FC4vH4uLON+KyDZgILtiZnl2tyymfneZ0Tlv2fr1vR8X3rofOdJ50PoNNpBQCXaWX6uTfd+lFFzaI8BEOFdquNbNq/CwqnV4NtdJhP6R1Hd9cd3f7dLyAI7sREOv+5/7xibUlBis7rYyAY8IU3ft24+9Otbc+aze4+AOBqnOhcDC+5vLbm9rvufnagt/frdWv++NrY4BgHDkgSaJ1OnldRqH28ME1atvDyYpQkCYBwBDzewMRTr+17pO7wYKM+W3M9IZPUsJGIACJhuyY5ja6+6pa84cEhoUKpRYS0KHJo25+/2P/x9tsmi8hzpv1zAfqbOYvUIpU2M/Wl6mvvWmFMz0XYcAR8Lhd0njgCyqQk8NntoNQlhnd9+PYTrXWNf+XK+6rKxPtXP/rTe2ihAOXq5IFh28hzb3678ljj6MGoYiYBoTXLrpl29Z13Pjdz2vRModMV3Lz1yy3r1777Utfx5qHJVoFMz1JNry7RPJVvTMiqnp0FIa8LGBbzv/d583MfbWz9dPI4IU6BqGTB7CeyymrmJqUXEUN9naBNSgWColmnddC297N37mg/3P51XJU9ZV10voCwlNKUK6SpJWunL/iJUqvUAkRYiETCYBnph/GxYcgtmQ72sQHb9r+8d0dfc3uzSESKfnp55usP3nV5dTDAACXA4dMvj+1ds/bA/cEg2GKnqZnlxSkrHnp49ezLFs4TCggslRRCxOthtu7YtvuTDz96+dDX21snjxflFekW1RRrfregyihOT5GA0xlgGzqd3z372sFVNpvTAiRQ6Xn6W4ouW7aSomWY3+0BjCTBkF0IKGAQCgWYzpaDr9V/+M5vx8fBfa4+7WyAor/jQowwziq8V6LPW11ZM5/SKDU8oGFTB9ito6BNMoLV3A8EBif3ffbpvea+QZNaTaXcfHXpBzcsm2n0ePwgEBDwq99ufPnQ0aE1MWMIJCExQb781488ufDaG66RyGU4hBlQ4QToKSF4PZ7w7roDx997+83VdVu2Nk6GOl07x3DvFVWpd1bPSiNCIRQcPmT8lQ8O3b1zd/sxfYamOGPGzJc0hgKjMbsQejuaIRxiID2/HFhubOt1BRr3b37x4Lfbnodx3qzPWkCeC1C09qHS55SvlGgzVlXMmUdqVVqIsBFoObKPbxoLyqtgwmaGxn07dzTu3fO41+qw6nTCstuXVby15MpKjdPpgQiLwvUPfHDL2Ij/u8nSHyiZjLp+5YP3LLrp1vtkSjUJbAQiTBi4IUeuSAQ4ioIn4Ge/2bXz1IfvvvPY0V17TgYCgUhWuqJg7rSkNcuuLMmgxSJuXh1av7HxxXc/PPInfaYqP3vOgjUypS4tKSMPwqEQjA2ZQK5OArlCDf3tR037Nqy9ydLvOjpp1BygMxaQZwIUqx4UFEBnFk57VKQxPlw2ey6pVWl41+451QhBnwfyK+YAhiLQ0XRw2/Y/ffC43WIZT00S1Sy/smjN0sUVCo8nAMFQBG559OPrLEM+zn/CQqEQn3vDtQuvuO3OZ4x5BVo+D3BlNBsBgmUhXSIGCsf5M/f5/VD3/aGe3du2Pv/Zu2/tpACTXzY76cmr5mddkZ2VhLq9ociBhsFPnnxh1+9oGiS58+a8pM8qq07JLgSFXA2cB3F9WoIuBeq/+mDd95u/XQnAhxdXE8XWRX9XG50NUNSgMZkMRInFlauEGuMDZVW1pFadyBuaZXQAJkaHIL+sil+B6G07tn3Lu2+usg9bbMnJouqrF+SsWXF1RYLXF0K4VYo7H9/0QHenjTPwcGnNrIxl9973ek7FrBJSKEQwggCEjQDjD4A/6INkmRxCERaYcBiCwRB43B6mfsdX77z65OqXAwEnLJxp+OWPZyXfM3NmHun2MWyHyb73of/a9EAwCP7MyvRHKq+89Q4uxNgwCzbLCLhdDtDoDbDvr28+d3z7wRcmpwrcSDaqoCkz2rkA8YWhRALixNIZjwnVhgdKZ84hdIl6XkEulx1GTB2QVzITcBwH06lj+79c+/bDtgGzWa+nS2vLdO/cvrwiMQI4iEQkvPjewfc3fd3BLdkEr334/tsvX37zE0EEox1+L7h9PgiFQwDI6fnzjMxcCIcifCIIMyG2u7315PvPrH7A1NTSxd2c6eW6ZVfVGlbPm5Mt8gUBOoccxx76r813MQzpTy9Lebz2ll9fr1YkAjctcTjGwTkxBuqkVPbIV+s/OLhpJ6cgbtkoqqAzVtdTAYoqJ+o/mFgMEn1pxaOU2nh/QeUMIiU5je+8gwEfmLpaIKuwkhVSFNLffrxl21/evWu4vd+kUFBpFfmqD265qiBdoxIDTuBwvM1y7IW19XeMjXmGyxfWFBVdtuhJaaqxisFQDOVm0Tg3i0b5UCtLzwYCEAhHwmxvx6nObevWPnN4yzecf/HzobJ81ZU3/CT7uVnT06SBYATaTeONK5/ec6cyRZ1kKC1fU7HwOgMtEAMTCoHb6wC71QyqxBRo2P7JurqN2zlA3LSRUxAHJ2rUf7dUdC5AXHuBgRjEGSXlv6Y1xgcyC4rJzIxcPqS4PsrUfRLSsotAIpbBSG+Ldfdn61d0HDnRLhaTstLchLeqShJnz52WhDAsCiEWHXv706YHdnzHz4XwvNrZBdMWXfmcVJ9ayggwBIkO7BEEig1GIDECzIN9Ezs+W//kgU++2BoIBLisw4UCVlqgvPre5XnPFmbKJN5gBNr6vYce/P3ee4x5ucVJBaV/mHnFcmXYF4JwOAwejwMcDisoVDoO0HuHN+1cNakgDvYlA+L6IjpjRtH9tC7rUW1KGllaNp0HFAkzYOpuAb0hA2QyFTjGh8N7Pnrvwab932/iCuBpxeqHM5Mldy+uTUNDYQCZjGYON49ueO/z9qcsFidXJZOG4uKcGVdd9YgmO3suw40CAEBIUpCbZACv0+4+sG3La1+9s/b9gMvFtR7cHeZuKrFwTtJdD1yftVIpJwWBUITd3TCx9am3jq3KLiuoyZxR+8z0uYtlbrsDIpEIuFw28HpcIJElQP3W9a8c/+bA05MKuiRApxvT00+BoSTjdllaye9E8gS6ctYcoARCbrEB+rtaQaZUgUZnADbCwL6Nb27d99ed93LyNRhEtUVG5WvzK3Xy3AwlDFs8wABq27Cj+z/3HOj/cvLukfrc3NSqJUt+kVxYfI0PYUVSoQhSFEqmftc3n3774ft/NPcMDMdmG5VEoLjtuvSnrpiTtIyNRDAUx8Pvbe55c93Grtdzq8uum73k5kcTtWm0x+UGQFBw2scgGPADJRTCoS3rH2vZd+zPUwCKrYf+VlWfKcSi/VcUEKnL1ixW5sx6haQl8qLyStBq9bxXjA72gss1wWcyHljbEdumt15c7hj1nyJJkM2u1L99Ta1xDsaEINmgBCbMQvewe3Dd1q6HT540H4i2EZrMTH3JvHnL08vKbxMnKCWW9tbdO9//4KmR3l7TpO9ELwCrqlCV33FVxmu5RlmaPxCGMUfI88aG9gfrWybqi+bNfnT+tXesCAcB83pdQFI02Lh1S+7kWIap3/zpjV0NrVyIc0tCsQq6aEBciJHyRKpYX1K1HhepksViMaj1SSBXaYEmcGg7egDK5v6YWzuHMBNgvln38rOnDtR/EAhAZG5V8upr52feOG6ZAL1WDAqlBAQEwn7fPt6x7cDA7060jNf5/X7OLAkgSWnpvNp5WmPK/La6Q6/2N7f1cBdCUYBrtUpaKMRxBAFRdbnqlaurUyoIHFCuZ935/fCJtz/tuC8QIQPTFi/644xFy2f4nF7E7Z6AgM8HLrsVJAoNuG3Dw/s3/OV6y4Dl5GQ1HzXpC85isQriZzMggISsiqL3CYWxOuh2A4rjoDKkQWFZJYz1tvNZKrNwGi/N7qYDJ0d6Oj4f6WxvlGGurPkVyc8YdSJcIcZAKqEgyJ0WikDPkKevocP6/q7DI7vGhidGomqaDGvuDnNPvGZa0tJF8zN+kqCUCiMRJEEnYrJJoRAQjECcDrv3/S2nXt5WZ/qLLlmTn1ez4E8l1VfKg14fuBw2wAgcxHI1hEIMa2o+uP/b9evuDrqD5kn1/EMAcWHGLdPQuhzVclqW+FAEJWS0OlUiEEuRtOxcUCsSwHTqOGSXzgQhLYVg0BcOBfyBoVPH+o9++fEregW5IDGBvlIuIgQ5RgUUZyuBRXEuw7AhBrwtJlfntsMDXzY0DW8KeUMTkwbASz5VL8pZcpnh1R9XZ+b09Fkgw6gCQAXAohiLoxH46zetRzft6H7EbPUPGItT75KlFa9U6g1IYcV0cDkmQCSTAcLiEAwGw427v3jz8MavnudKuMkUf9GA/jZ/jk73JiGJAUAsT5JX6oor/5uUqJMUai0UFJaCZagbSIICXWrm6VqGm7yjwLbVfTnY/O23qyO+iewMvXiJQixImV6oJQoylYCQAr5KpjAWHK4gNHbZJgbHvPXhMHsCQ2AcwdiCDL1k4cwipZaiaWjvGAatVgE4LePmYXCwYXDik6/aHu/qc3zDwTRWGF+gNflLi2bNQZJT08E6Ogw+v5PVpxeA1+OGxt2bP6n/9AsuxXMZlIMTXwedV6sRWyhy6uFCLPrklEQBAfK00vwHZan5N+NCMZZVUAQKkQRMHU2QmJoJ6sQUYDlICMJ5UqSzYe/Jo19uXBPxOp3ZBtntiQmiBUa9lOTUpNeIIRIO8S1FiAHw+iMQDrOAYijQFAFiEQYoMHxFjUAYRGQEzOMAR9ud1j1HBt6obxn7GIK8Igh1mrI2v+ZHz5YvuErHeH38KIYQCUGTnAleh40d6Tj+2aY/vs4ViVzJ8A8DFAuJXxHlIMkShRVJpTNfJ2U6tUAkhmlV1TA+2AcjvR2QO2MuiKQKvtrm4sQ61BcZ7jpuPbVr+zMOm70lUS9cnpMkv14lpURapRDKclUgFmL88RiJAkGg4A8hvBJFQgJI1A+AhMHlDMCJU3Y43um0t/U532jtmvjI7Q5yauDuPGEsz6yuXnrz6wpdjtTvdsO4pR+Sc4ohHGFBL0BYSdh34LH7f/UfLquV8yDOmC9KQZwFRE06thY6bdaTA3UAEBnK0ldK00p+hpE0pk1OgaysXLCO9IPLbgNj0TSghCK+ruPKfFoiAufY4ET7we8+bD90aKuMjmQadJKlCRKqSCjAFZoEClUrhCATC0AqJkBA8hs8IMwi4AsEwGp1s10DLrdp1NPU1TfxcdeIezcEeSVwD8JYkDpt+pIVL6TlzzJ4nB5k3DIIpJCGBG0KABOAm2ZXwLjVbL7vwZXXtNXXt8WZ9BnX7s+rWZ3MKrFhxhePUp00R5df/BKVkJxLUjSSkVcIWo0WxoZ6wed1QXJWEVC0GDxOB7icVkjLLWJtg/2BoVMNzR1H6jZae3paRRSbrFPS0yRCopQi8SRaiIuEBIaiGL+IyDIRYDyBsH3C6W2w2Hx1Q2OugxMTDDeG5fb+cBcmyKzMqZy2eOkTSVkVRX6XD+EmDDZLP2SUVgEhEEKuQgQ3zquG3uGB0KO/eeTmbZ9s3h6X5i8JULyK/teTSBCn5mVeL0nLf4igJGJaKof8sgoQ02KwjvSCbWQQNGlZoNDowXTyGGRVVgGEUa47B4dtyN3TsK/NPjJwcPBka0PA7RuR0KhYSJMaAQESbjzKAuv3B8PjHn94zOoIjQU9Qc5rODCnWw4BCMtqZt1QsnDxrSp9ttHvCaDjIwMw3NMCqYUV/JAMCXnZlVcvAl2CErF7PeyDv1n54vo17/x+sheLDbHo4sH/mU2fa2DG/f5/18NOv/4/pk3JKaO+IHu1RJc3B8EJRCSVQensGqBICiz9HdB/6iSoUoygSNQDIeBCDsDnsoPXOQFKXRIQGBHxjFvs/a31zWOm/q89dm+L0zZiG+0btcZ5RLQPYymKohTJ6ix1etLPZ1196xVSmZZyTXAd+wiY+06BNi0HErSpEAy44bo5ZVBVUATcLhQGEHh6zXNbn3v0t7dO0c1fECB+X1fMM15FUVCcJwlkamFlYnH58wJFkoGTdOXcBSARywETEGAd6oWRzjbASAGQYjFLEgJEoU0CSYIa2BA362EgEg7zW339Xjvrnhh1m3tOHWrYvnWV1WQd/bs9hgKg04uz7tWmZS9WG/KMEqUG8Tmc4Bof45eytYYskKtT+K03uH+EKcpODChoqZtAKQeKkI49+/cfevXJZ1cD8PPoi1ZQFFD0Z3ThMNqbxaqIey3S5SUtSkgv/A2J0wlzFtQAqUlDUJzi03U4FOAr70DAy7Yf+g5SsksQuVoHbDjMd9vcMJ0bkrGRCA/K3NNsqdu44aaBk6c6eEAkcNKLcGttGoP4p7rS2pdTcwpIHCNAoU+FcCAAIa8XKJEYSErEr/tzkwaL6YRpwtT+jsfpGAr6Qla/KzBhdU5YrT1DHHiuD7skQPEqihaPHJC/CzWCJtRpxXkrl95w9bI7lv4HtmHH1zAhUACLUUAQFD/r8Xtd0H38ILisY3xvpNIbgJYoeHgcGARBeVB+tx1OHd7e67QMdpGUVINgkOEcH20YPNm5Sp2d/kehMn2aSqOCgqp5AAxyepwdOT3P5uOEZflFzOGekyfqN372K6tpaGDSuzj/4tqX2BooOg+64BCLmlV8qPFL0JOQuBCLwqJnLq752Ypbrn54xcJbKe5cm9rb2IbuHhhwBUGs1HEIgGGCwAR8YLeYwWEZAb/Hw+9qFVAi4OopWiIHUiAE1/goOGyj/KZybseaz2kZaNq5abXMkP8wQStzMguLITWrgAfr83nAY58AhUrLTxhCTBAslkFf95G9b3Yeqv9T0M2bOwclqppoFx8duV7wqkask0eNPLb9iA81DhSRMS13/i133fCHW6+6PUEhVk6evBf2fH+I/fpQHShyKoDAKQSYCB8C3IVzY1vXxChYBnrB73byQ3ZCIACCpkFryAShSA7j5gEY6W5xdh377kVKqllEKVJnZRWVQWJWFthGzTDQ3gpBlxNKquYBiyLQ39POjrTXHx1qblvlsXm4iUBUMVFA8VX0JQGK9aPYLj+qpGgBSdA0kXjdAz9bt+rex/KVUm5vMwn45OSxo6edffqNl2AcSQC5UosoFCoQiThrQflswLUSAb8HggEP+DwOvgOXSBIgzI0iTxt4qGnP52+be1oUtK70RqkmkZ9qeuxWf9DjQsJBViDVJgKKIyHHcHuTtf3Uavuol1uR5UIqWjXHgomuaMT+U8x59WJTrlGfI6tFIdG1SxY8/OKzf/hlojIR/EyAdfucYHdaoMfUC6+8/T6LSFIRFCcQHCeAFkv4XaoisQSEtBhIguQWNXjj5jaUc+HDbc1jgeUnBN2Nez9u3b3lhCx92u8JIRUI+xydnrGhbSxEjJQidTFJUyG/bXintX/gL65RVzyc2NYi1pwvemU1HtSZQi02o1HphVnFt9x1yxuEAMPGHXab1+u2eTyCfL9BAAACwUlEQVQeb1/PADk4aEZpVUo5TifIEQznrpx/cKsZ3DyJ+wcWDMN5ZaDcNICLDYYBxu+HUMDttXQeeWG0uWeHMtdwNxNgmtxjtqNuq9sqllNqiV59edgfGHSNTBzz+ULc2n+8z8SONqLGfNZFw9jQOZNqzgQpmvbjDZvzIrEqLTEZAYTyuVxBv8PtZxgIAQEYznJbaOQZYo3mxwKlupIUJihRUiBEEBQ/PSM5nZGi4BCWe4RZlo1E/Lb+9oFjx+/2ufg2g7sp0TvPYY4mDe41B4b7Xeya11Rw4pd6ptxxdra1+fMJtahZR4dq0Z9kzMA/PhvyiqMoSKBVkkyhTG4gxAk6gqSkgAuEgAKOsEg4EmFCSJjxhQKBiXDQPeEfH2+y9I/XR9f140I+eh3cRUZXSrmf8WCiyomFe9Zd+BcDKL54jFbZ8cVj9P2osceGaLR04I8hCCABJwicW5/mNIRAhGGYMCD8NvIABP82YI/1i+jfiL2RsYBiFRSbzs8bzsWE2FS1UbRXiy0go8qKQoqtpWIL0DOpNPYiLuSCYtUTC+WClRN7oefrP1PVRlOl/Xg4sQqaSkVT3ajo+CHWJ2JHErF+Efs6FlDUh2Lfiyosei3n3Ol6sSEWq4J4SLGAosVlbEjFtzDxior1hFhQZ1NSLLzocfFLyhcM51JCLPazsRV2PKxYQPFgYsPuTDfqTKEWX7vEQ42qJh7ceSvnUkMs3ov4ciZmN368cqaCwR0fr55YUPEhNRUs7vNTKS7+s2cKyXPay6WE2NkgxWaYM4GYyrijwM4UZme68PhUHT0uFmD863PCudQQi1dhvAFPla1iwU11fPxJn0sdU4XMmdRyTkOeitg/QkFThWvs340FEe9dU92k2KJvqhCKvnfWAm/ypC4KSiyofySgsyky/numAhgLOv7CpgqhM4XIJUOJ/cP/A11yVirPZrFvAAAAAElFTkSuQmCC"

    let req = new Request(url)
    let icon = await req.loadImage()
    return icon
}