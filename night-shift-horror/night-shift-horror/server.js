const express=require('express');const http=require('http');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);const io=new Server(server);app.use(express.static('public'));
const players=new Map();
function clean(p){return {id:p.id,name:p.name,x:p.x,z:p.z,rot:p.rot,skin:p.skin,alive:p.alive,hidden:p.hidden};}
io.on('connection',s=>{s.on('join',d=>{if(players.size>=15){s.emit('full');return} const p={id:s.id,name:String(d?.name||'Player').slice(0,16),x:0,z:0,rot:0,skin:d?.skin||0,alive:true,hidden:false};players.set(s.id,p);s.emit('state',{players:[...players.values()].map(clean)});s.broadcast.emit('joined',clean(p));});
s.on('move',d=>{const p=players.get(s.id);if(!p)return;p.x=Number(d.x)||0;p.z=Number(d.z)||0;p.rot=Number(d.rot)||0;p.hidden=!!d.hidden;io.emit('moved',clean(p));});
s.on('respawn',()=>{const p=players.get(s.id);if(!p)return;p.x=0;p.z=0;p.alive=true;p.hidden=false;io.emit('moved',clean(p));});
s.on('disconnect',()=>{players.delete(s.id);io.emit('left',s.id);});});
server.listen(process.env.PORT||3000,()=>console.log('Night Shift server running'));
