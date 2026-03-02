import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './schemas/conversation.schema';
import { Message } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  // Get or create a conversation
  async getOrCreateConversation(
    type: 'customer-staff' | 'staff-admin',
    initiatorId: string,
    initiatorName: string,
    initiatorRole: string,
  ): Promise<Conversation> {
    let conversation = await this.conversationModel.findOne({
      type,
      initiatorId: new Types.ObjectId(initiatorId),
      status: 'open',
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        type,
        initiatorId: new Types.ObjectId(initiatorId),
        initiatorName,
        initiatorRole,
        status: 'open',
      });
    }

    return conversation;
  }

  // Get conversations by type
  async getConversationsByType(type: 'customer-staff' | 'staff-admin'): Promise<Conversation[]> {
    return this.conversationModel
      .find({ type })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit = 50, skip = 0): Promise<Message[]> {
    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // Save a new message
  async saveMessage(data: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    content: string;
  }): Promise<Message> {
    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(data.conversationId),
      senderId: new Types.ObjectId(data.senderId),
      senderName: data.senderName,
      senderRole: data.senderRole,
      content: data.content,
    });

    const conversation = await this.conversationModel.findById(data.conversationId);
    if (!conversation) return message;

    const isInitiator = String(conversation.initiatorId) === data.senderId;

    await this.conversationModel.findByIdAndUpdate(data.conversationId, {
      lastMessage: data.content,
      lastMessageAt: new Date(),
    });

    if (isInitiator) {
      await this.conversationModel.findByIdAndUpdate(data.conversationId, {
        $inc: { unreadByResponder: 1 },
      });
    } else {
      await this.conversationModel.findByIdAndUpdate(data.conversationId, {
        $inc: { unreadByInitiator: 1 },
      });
    }

    return message;
  }

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) return;

    const isInitiator = String(conversation.initiatorId) === userId;

    if (isInitiator) {
      await this.conversationModel.findByIdAndUpdate(conversationId, {
        unreadByInitiator: 0,
      });
    } else {
      await this.conversationModel.findByIdAndUpdate(conversationId, {
        unreadByResponder: 0,
      });
    }

    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: new Types.ObjectId(userId) },
        isRead: false,
      },
      { isRead: true },
    );
  }

  // Assign responder to a conversation
  async assignResponder(
    conversationId: string,
    responderId: string,
    responderName: string,
    responderRole: string,
  ): Promise<Conversation | null> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        responderId: new Types.ObjectId(responderId),
        responderName,
        responderRole,
      },
      { new: true },
    );
  }

  // Close a conversation
  async closeConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      { status: 'closed' },
      { new: true },
    );
  }
}
