import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Query('type') type?: string) {
    const conversationType = type === 'staff-admin' ? 'staff-admin' : 'customer-staff';
    return this.chatService.getConversationsByType(conversationType as 'customer-staff' | 'staff-admin');
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.chatService.getMessages(
      id,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
  }
}
