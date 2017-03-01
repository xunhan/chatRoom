/**
 * Created by Chenxi on 2017/2/7.
 */

    'use strict';

    const net = require('net');
    const readline = require('readline');

    const rl = readline.createInterface({
        input:process.stdin,
        output:process.stdout
    })

    rl.question('enter your username  ',(name)=>{
        name = name.trim();
        if(name === '') throw new Error('大侠应当有一个响亮的名头，请重新来过！');
        const socket = net.connect({port:3000},()=>{

            // 登入操作
            const user = {
                protocol: 'signin',
                username: name
            }
            socket.write(JSON.stringify(user));
            console.log('已连接到 3000 聊天室');
            socket.on('data',(chunk)=>{
                try{
                    const content = JSON.parse(chunk.toString().trim());
                    const protocol = content.protocol;
                    switch (protocol){
                        case 'boardcast':
                            console.log('【boardcast】 '+new Date().getMinutes()+' : '+new Date().getSeconds()+' [['+content.from+']] : '+content.message);
                            rl.prompt();
                            break;
                        case 'p2p':
                            console.log('【p2p】'+new Date().getMinutes()+' : '+new Date().getSeconds()+' [['+content.from+']] : '+content.message)
                            rl.prompt();
                            break;
                        default:
                            socket.write('play with your balls');
                            break;
                    }
                }catch (e){
                    console.log(e);
                    // socket.write('do again.')
                }
                //console.log(data.toString().trim());
                //process.stdout.write('client > ');
            })
            rl.setPrompt(' > ');
            rl.prompt();
            rl.on('line',(line)=>{
                // 默认格式 为广播格式
                //  p2p 模式 标准方式 为 /name+空格方式 正则匹配
                // /chenxi 我是韩寒
                const data = line.toString().trim();
                let send = null;
                if(data.charAt(0) === '/'){
                    const regex = /^\/(.+)\s(\s*.+)/;
                    const to = data.match(regex)[1];
                    const message = data.match(regex)[2].trim() || '';
                    send = {
                        protocol:'p2p',
                        from:name,
                        to:to,
                        message:message
                    }
                }else{
                    send = {
                        protocol:'boardcast',
                        from:name,
                        message:data
                    }
                }
                socket.write(JSON.stringify(send));
                rl.prompt();
            })
        });
    })



