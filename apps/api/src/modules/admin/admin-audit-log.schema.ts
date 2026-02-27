import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminAuditLogDocument = AdminAuditLog & Document;

export enum AuditActionType {
  BLOCK_USER = 'BLOCK_USER',
  DEACTIVATE_USER = 'DEACTIVATE_USER',
  ACTIVATE_USER = 'ACTIVATE_USER',
  DELETE_USER = 'DELETE_USER',
  APPROVE_WORKER = 'APPROVE_WORKER',
  REJECT_WORKER = 'REJECT_WORKER',
  SUSPEND_WORKER = 'SUSPEND_WORKER',
  UPDATE_USER = 'UPDATE_USER',
  VERIFY_KYC = 'VERIFY_KYC',
  REJECT_KYC = 'REJECT_KYC',
}

@Schema({ timestamps: true, collection: 'admin_audit_logs' })
export class AdminAuditLog {
  @Prop({ required: true, enum: Object.values(AuditActionType) })
  actionType!: AuditActionType;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  adminId!: Types.ObjectId;

  @Prop({ required: true })
  adminName!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  targetUserId!: Types.ObjectId;

  @Prop({ required: true })
  targetUserName!: string;

  @Prop({ required: true })
  targetUserRole!: string;

  @Prop({ type: String })
  previousValue?: string;

  @Prop({ type: String })
  newValue?: string;

  @Prop({ type: String })
  reason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  performedAt!: Date;
}

export const AdminAuditLogSchema = SchemaFactory.createForClass(AdminAuditLog);

// Indexes for efficient queries
AdminAuditLogSchema.index({ adminId: 1, performedAt: -1 });
AdminAuditLogSchema.index({ targetUserId: 1, performedAt: -1 });
AdminAuditLogSchema.index({ actionType: 1, performedAt: -1 });
AdminAuditLogSchema.index({ performedAt: -1 });
