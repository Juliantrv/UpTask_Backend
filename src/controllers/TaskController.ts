import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
    static readonly createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            
            task.project = req.project.id
            req.project.tasks.push(task.id)
            
            await Promise.allSettled([
                task.save(),
                req.project.save()
            ])
            res.send('Tarea creada correctamente')
        } catch (error) {
            console.log(error);
        }
    }
    static readonly getProjectTask = async (req: Request, res: Response) => {
        try {
            const task = await Task.find({project: req.project.id}).populate('project')
            res.json(task)
        } catch (error) {
            console.log(error);
        }
    }
    static readonly getTaskById = async (req: Request, res: Response) => {
        try {
            const task = await Task.findById(req.task.id)
                .populate({
                    path:'completedBy.user',
                    select: 'name id email'
                })
                .populate({
                    path: 'notes',
                    populate: { path:'createdBy', select: 'name id email' }
                })
            res.json(task)
        } catch (error) {
            console.log(error);
        }
    }
    static readonly updateTask = async (req: Request, res: Response) => {
        try {
            await req.task.updateOne({
               name: req.body.name,
               description: req.body.description
            })
            res.send("Tarea actualizada correctamente")
        } catch (error) {
            console.log(error);
        }
    }
    static readonly deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString())
            await Promise.allSettled([
                req.task.deleteOne(),
                req.project.save()
            ]) 
            res.send("Tarea eliminada correctamente")
        } catch (error) {
            console.log(error);
        }
    }
    static readonly uptadeStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send("Tarea actualizada")
        } catch (error) {
            console.log(error);
        }
    }
}