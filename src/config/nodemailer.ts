import nodemailer from "nodemailer"
import dotEnv from "dotenv"
dotEnv.config()

const config = () => ({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const transporter =  nodemailer.createTransport(config());