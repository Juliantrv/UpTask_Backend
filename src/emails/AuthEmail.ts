import { transporter } from "../config/nodemailer";

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {
    static readonly sendConfirmationEmail = async ( user: IEmail) => {
        const info = await transporter.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: user.email,
            subject: "UpTask - Confirme su cuenta",
            text: "UpTask - Confirme su cuenta",
            html: `<p>Hola: ${user.name}, ha creado su cuenta en UpTask, ya casi esta todo listo, solo debe confirmar su cuenta</p>
                <p>Visite el sigueinte enlace</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                <p>Ingrese el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }
   
    static readonly sendPasswordResetToken = async ( user: IEmail) => {
        const info = await transporter.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: user.email,
            subject: "UpTask - Restablecer contraseña",
            text: "UpTask - Restablecer contraseña",
            html: `<p>Hola: ${user.name}, ha solicitado restablecer su contraseña</p>
                <p>Visite el sigueinte enlace</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer contraseña</a>
                <p>Ingrese el código: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos</p>
            `
        })

        console.log('Mensaje enviado', info.messageId)
    }
}