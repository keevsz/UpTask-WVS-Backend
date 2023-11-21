import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TaskService } from './task.service';

@WebSocketGateway({ cors: '*' })
export class TaskGateway {
  constructor(private readonly taskService: TaskService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('openProject')
  create(@MessageBody() { projectId }: { projectId: string }) {
    console.log({ projectId });
    this.server.socketsJoin(projectId);
  }

  @SubscribeMessage('newTask')
  newTask(@MessageBody() { task }: { task: any }) {
    const project = task.project;
    this.server.to(project).emit('Task added', task);
  }

  @SubscribeMessage('removeTask')
  remove(@MessageBody() { task }: { task: any }) {
    const project = task.project;
    this.server.to(project).emit('Task deleted', task);
  }

  @SubscribeMessage('updateTask')
  update(@MessageBody() { task }: { task: any }) {
    const project = task.project;
    this.server.to(project).emit('Task updated', task);
  }

  @SubscribeMessage('changeStatus')
  findOne(@MessageBody() { task }: { task: any }) {
    const project = task.project;
    this.server.to(project).emit('Task updated', task);
  }
}
