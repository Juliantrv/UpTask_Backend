import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document{
    email: string
    password: string
    name: string
    confirmed: boolean
}

const userSchema: Schema = new Schema({
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const User = mongoose.model<IUser>('User',userSchema)
export default User