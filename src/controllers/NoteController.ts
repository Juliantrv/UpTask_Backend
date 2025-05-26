import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static readonly createNote = async ( req: Request<{}, {}, INote>, res: Response ) => {
        const { content } = req.body
        const note = new Note()

        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            await Promise.allSettled([ note.save(), req.task.save() ])
            res.send('Nota creada correctamente')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Hubo un error" })
        }
    }
    
    static readonly getTaskNotes = async ( req: Request, res: Response ) => {
        try {
            const notes = await Note.find({ task: req.task.id})
            res.json(notes)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Hubo un error" })
        }
    }
    
    static readonly deleteNote = async ( req: Request<NoteParams>, res: Response ) => {
        try {
            const { noteId } = req.params
            const note = await Note.findById(noteId)

            if(!note){
                const error = new Error('Nota no encontrada')
                res.status(404).json({ error: error.message })
                return
            }

            if(note.createdBy.toString() !== req.user.id.toString()){
                const error = new Error('Acción no valida')
                res.status(401).json({ error: error.message })
                return
            }

            req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString() )

            await Promise.allSettled([ req.task.save(), note.deleteOne() ])
            res.send('Nota eliminada')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Hubo un error" })
        }
    }
}