import type { Request, Response } from "express";
import Porject from "../models/Project";

export class ProjectController{
    
    static readonly createProject = async (req: Request, res: Response) => {
        const project = new Porject(req.body)
        // Asina un manager
        project.manager = req.user.id
        try {
            await project.save()
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    
    static readonly getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Porject.find({
                $or: [
                    { manager: {$in: req.user.id} }, // Filtra los projectos por la persona que los creo "manager"
                    { team: { $in: req.user.id } } // Incluye en el filtro a las persona que pertenecen al "team" del proyecto
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static readonly getProjectById = async (req: Request, res: Response) => {
        try {
            const project = req.project
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
                const error = new Error('Acción no válida')
                res.status(404).json({error: error.message})
                return
            }
            const projectWithTasks = await project.populate('tasks')
            res.json(projectWithTasks)
        } catch (error) {
            console.log(error)
        }
    }

    static readonly updateProject = async (req: Request, res: Response) => {
        try {
            const project = req.project
            
            project.clientName = req.body.clientName
            project.projectName = req.body.projectName
            project.description = req.body.description
            
            await project.save()
            res.send("Proyecto actualizado")
        } catch (error) {
            console.log(error)
        }
    }

    static readonly deleteProject = async (req: Request, res: Response) => {
        try {            
            await req.project.deleteOne()
            res.send("Proyecto eliminado")
        } catch (error) {
            console.log(error)
        }
    }
}