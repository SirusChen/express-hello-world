import http from 'http';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

/**
 * 1. 通过登录记录用户名
 * 2. 广播房间信息
 * 3. 开始游戏
 * 4. 进行投票
 * 5. 返回结果
 */

interface SocketData {
  name: string;
  isVoted: boolean;
}

type ISocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>

const RoomId = 'mainRoom';
let userId = 0;

async function broadcastUserInfo(room: BroadcastOperator<DefaultEventsMap, SocketData>) {
  const socketList = await room.fetchSockets();
  room.emit('userList', socketList.map((s) => s.data));
}

export function useSocket(server: http.Server) {
  const io = new Server(server);
  const room = io.to(RoomId);
  io.on('connection', async (socket: ISocket) => {
    // 初始化
    const userName = `user${userId++}`
    console.log('connection');
    socket.join(RoomId);
    socket.data.name = userName;

    // 房间情况
    socket.on('roomInfo', () => {
      broadcastUserInfo(room);
    });

    // 注册用户
    socket.on('register', (userInfo: SocketData) => {
      console.log('register', userInfo);
      socket.data.name = userInfo.name || userName;
      broadcastUserInfo(room);
    });

    // 游戏流程
    socket.on('startGame', async () => {
      console.log('startGame');
      room.emit('startGame');
      const socketList = await room.fetchSockets();
      socketList.forEach((s) => {
        s.emit('word', userName)
        s.data.isVoted = false;
      });
      broadcastUserInfo(room);
    });

    socket.on('vote', async (userInfo: SocketData) => {
      const name = userInfo.name || userName;
      console.log('vote', name);
      const socketList = await room.fetchSockets();
      socketList.forEach((s) => {
        if (s.data.name === name) {
          s.data.isVoted = true;
        }
      });
      broadcastUserInfo(room);
    });
  });

}
