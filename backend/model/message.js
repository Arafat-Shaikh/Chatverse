const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  message: String,
  from: Object,
  roomId: String,
  time: String,
  date: String,
  to: String,
});

const virtual = messageSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
messageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
