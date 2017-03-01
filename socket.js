/**
 * Created by Chenxi on 2017/2/7.
 */
    'use strict';

    const net = require('net');
    let clients = {};

    let server = net.createServer((socket)=>{
        //console.log(socket.remoteAddress,socket.remotePort);
        console.log(`欢迎来自【${socket.remotePort}】的【${socket.remoteAddress}】加入 3000 聊天室`);
        socket
            .on('data',clientData)
            .on('error',(err)=>{
                let delUser = '';
                for(let k in clients){
                    if(clients.hasOwnProperty(k)){
                        if(clients[k] === socket){
                            delUser = k;
                        }
                    }
                    
                }
                delete clients[delUser];
                console.log(`${socket.remoteAddress} 下线了，当前在线人数 ${Object.keys(clients).length}`);
            });
        function clientData(chunk){
            //console.log(new Date().getMinutes()+':'+new Date().getSeconds()+'client > '+chunk.toString());
            //socket.write(new Date().getMinutes()+':'+new Date().getSeconds()+' client > '+chunk.toString())
            // 传送过来的数据格式{'protocol':'boardcast','from':localPort,'message':'i'am jack'}
            try{
                const content = JSON.parse(chunk.toString().trim()),
                protocol = content.protocol;
                switch (protocol){
                    case 'signin':
                        signin(content);
                        break;
                    case 'boardcast':
                        boardcast(content);
                        break;
                    case 'p2p':
                        p2p(content);
                        break;
                    default:
                        socket.write('play with your balls');
                        break;
                }
            }catch (e){
               socket.write('do again.')
            }

        }
        function signin(content){
            const username = content.username;
            clients[username] = socket;
            // const count = Object.keys(clients).length || '0';
            console.log(`欢迎 ${username} 加入 3000 聊天室，当前在线人数 ${Object.keys(clients).length} 人`)
        }
        function boardcast(content){
            const from = content.from,
            send = {
                protocol:content.protocol,
                from:from,
                message:content.message
            }
            for(let k in clients){
                if(clients.hasOwnProperty(k)){
                    if(k !== from){
                        clients[k].write(JSON.stringify(send))
                    }
                }
            }
        }
        function p2p(content){
            // {protocol:'p2p',from:from,to:target,message:''};
            const to = content.to;
            const send = {
                protocol:'p2p',
                from:content.from,
                to: to,
                message: content.message
            }
            clients.hasOwnProperty(to) && clients[to].write(JSON.stringify(send));
        }
    })

    const port = 3000;
    server.listen(port,(err)=>{
        if(err){
            console.log('端口被占用');
            throw err;
        }
        console.log(`服务器正在监听${port}端口。。。`);
    })