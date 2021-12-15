const fs = require('fs');
const formidable = require("formidable");
const expess = require("express");
const app = expess();
//創建伺服器
const server=app.listen(3000);
app.get('/',(req,res)=>{
    fs.readFile('client.html',(err,data)=>{
        if(err)
        {
            res.writeHead(500);
            res.end('錯誤:',err);
        }
        else
        {
            res.writeHead(200);
            res.write(data);
        }
    });
});
//響應上傳圖片
app.post('/upload',(req,res)=>{
    let form = new formidable.IncomingForm();
    //保留附檔名
    form.keepExtensions = true;
    //設定上傳目錄
    form.uploadDir = __dirname + "\\files\\";
    form.parse(req,function(err,fields,files){
        fs.rename(files.file.filepath, form.uploadDir +`/${files.file.originalFilename}`,err=>{
            if(!err)
                console.log("上傳完成");
        });
    });
    res.redirect('../');
});
//響應圖片要求
app.get('/files/*',(req,res)=>{
    res.sendFile(__dirname+'/'+req.url);
});
//伺服器連線
const io = require('socket.io');
console.log('伺服器開啟');
const io_server = io(server,{ allowEIO3: true });
io_server.on('connection',socket=>
{
    var img = fs.readdirSync('files');
    // console.log("伺服器端:"+img);
    socket.emit('allImg',img);
    socket.on('upImg',()=>
    {
        img = fs.readdirSync('files');
        console.log('upImg');
        io_server.emit('newImg',img);
    })
});
