
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Define aquí el esquema para la colección "messages"
  user: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
