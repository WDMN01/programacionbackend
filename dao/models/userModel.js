import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
  password: String,
  role: { type: String, default: 'usuario' },
});

const User = mongoose.model("User", userSchema);

export default User;