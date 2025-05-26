import type { Request, Response } from "express";
import User from "../models/User";
import Porject from "../models/Project";

export class TeamMemberController {
    static readonly findMemeberByEmail = async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await User.findOne({ email }).select('id email name')
            if(!user) {
                const error = new Error("Usuario no enctrado")
                res.status(404).json({ error: error.message })
                return
            }
            res.json(user)
        } catch (error) {
            console.log(error);
        }
    }

    static readonly getProjectTeam = async (req: Request, res: Response) => {
        try {
            const project = await Porject.findById(req.project.id).populate({
                path: 'team',
                select: 'id email name'
            })            
            res.json(project.team)
        } catch (error) {
            console.log(error);
        }
    }
    
    static readonly addMemberById = async (req: Request, res: Response) => {
        try {
            const project = req.project
            const { id } = req.body

            const user = await User.findById(id).select('id')
            if(!user) {
                const error = new Error("Usuario no enctrado")
                res.status(404).json({ error: error.message })
                return
            }

            if(project.team.some(team => team.toString() === user.id.toString())){
                const error = new Error("Usuario ya se encuentra asignado al proyecto")
                res.status(409).json({ error: error.message })
                return
            }

            project.team.push(user.id)
            await project.save()
            
            res.send('Usuario agregado con exito')
        } catch (error) {
            console.log(error);
        }
    }
    
    static readonly removeMemberById = async (req: Request, res: Response) => {
        try {
            const project = req.project
            const { userId } = req.params

            if(!project.team.some(team => team.toString() === userId)){
                const error = new Error("Usuario no se encuentra asignado al proyecto")
                res.status(404).json({ error: error.message })
                return
            }

            project.team = project.team.filter(team => team.toString() !== userId)
            await project.save()
            
            res.send('Usuario eliminado del proyecto con exito')
        } catch (error) {
            console.log(error);
        }
    }
}