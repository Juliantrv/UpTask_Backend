import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt";

export class AuthController {
    static readonly createAccount = async ( req: Request, res: Response ) => {
        try {
            const { password, email } = req.body
            
            // Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist) {
                const error = new Error('El usuario ya esta registrado')
                res.status(409).json({ error: error.message })
                return
            }

            // Crear un ususario
            const user = new User(req.body)

            // Hash Password
            user.password = await hashPassword(password)
            
            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            // Enviar Email
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([
                user.save(),
                token.save()
            ])

            res.send('Cuenta creada, revise su email para confirmar la cuenta')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static readonly confirmAccount = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})

            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true
            await Promise.allSettled([user.save(), tokenExist.deleteOne()])

            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly login = async ( req: Request, res: Response ) => {
        try {
            const { email, password } = req.body

            // validar que el usuario exista
            const user = await User.findOne({ email })
            if(!user) {
                const error = new Error('Usario no encontrado')
                res.status(404).json({ error: error.message})
                return
            }

            // Validar que el usuario tenga la cuenta comfirmada
            if(!user.confirmed) {
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

                await AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                const error = new Error('La cuenta no a sido confirmada, hemos enviado un e-mail de confirmación')
                res.status(401).json({ error: error.message})
                return
            }

            // Validar que el passwor del usuario sea el mismo registrado en DB
            const isPasswordCorect = await checkPassword(password, user.password)
            if(!isPasswordCorect) {
                const error = new Error('Usuario o contraseña incorrecta')
                res.status(401).json({ error: error.message})
                return
            }

            const token = generateJWT({id: user.id})
            res.send(token)
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static readonly requestConfirmationCode = async ( req: Request, res: Response ) => {
        try {
            const { email } = req.body
            
            // Validar si el usuario existe
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Validar si el usuario ya esta confirmado
            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado')
                res.status(403).json({ error: error.message })
                return
            }

            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            // Enviar Email
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([
                user.save(),
                token.save()
            ])

            res.send('Se envio un nuevo token a su email')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly forgotPassword = async ( req: Request, res: Response ) => {
        try {
            const { email } = req.body
            
            // Validar si el usuario existe
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El usuario no esta registrado')
                res.status(404).json({ error: error.message })
                return
            }

            // Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()
            
            // Enviar Email
            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revice su email para instrucciones')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static readonly validateToken = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})

            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }

            res.send('Token valido, defina la nueva contraseña')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly updatePasswordWithToken = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.params
            const tokenExist = await Token.findOne({token})

            if (!tokenExist) {
                const error = new Error('Token no válido')
                res.status(404).json({ error: error.message })
                return
            }
            
            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(req.body.password)

            await Promise.allSettled([
               user.save(),
               tokenExist.deleteOne()
            ])

            res.send('El password se modificó correctamente')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly user = ( req: Request, res: Response ) => {
        res.json(req.user)
    }

    static readonly updateProfile = async ( req: Request, res: Response ) => {
        try {
            const { name, email } = req.body

            const userExist = await User.findOne({ email })
            if (userExist && userExist.id.toString() !== req.user.id.toString()) {
                const error = new Error("Este email ya esta registrado")
                res.status(409).json({ error: error.message })
                return
            }

            req.user.name = name
            req.user.email = email

            await req.user.save()
            res.send('Perfil actualizado')            
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly updateCurrentUserPassword = async ( req: Request, res: Response ) => {
        try {
            const { current_password, password } = req.body

            const user = await User.findById(req.user.id)

            const isPasswordCorect = await checkPassword(current_password, user.password)
            if (!isPasswordCorect){
                const error = new Error('La contraseña ingresada no es correcta')
                res.status(401).json({ error: error.message })
                return
            }

            user.password = await hashPassword(password)
            await user.save()
            res.send('La contraseña se ha actualizado')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
    
    static readonly checkPassword = async ( req: Request, res: Response ) => {
        try {
            const { password } = req.body
            const user = await User.findById(req.user.id)

            const isPasswordCorect = await checkPassword(password, user.password)
            if (!isPasswordCorect){
                const error = new Error('La contraseña ingresada no es correcta')
                res.status(401).json({ error: error.message })
                return
            }

            res.send('Contraseña correcta')
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}
