import mongoose, { Schema, Document, PopulatedDoc, Types } from "mongoose";
import Task, { ITask } from "./Task";
import { IUser } from "./User";
import Note from "./Note";

export interface IProject extends Document {
    projectName: string
    clientName: string
    description: string
    tasks: PopulatedDoc<ITask & Document>[]
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true,
    },
    clientName: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task' 
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'User' 
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'User' 
        }
    ]
}, {timestamps: true})

// Middleware

// Middleware que se ejecuta cuando deleteOne es llamado en el controller
ProjectSchema.pre('deleteOne', { document: true }, async function(){
  const projectId = this._id // Extare el id del proyecto
  
  if(!projectId) return // Si no existe el project Id continua con el fljo del controller

  const tasks = await Task.find({ project: projectId }) // Busca las tares relacionadas al proyecto
  for( const task of tasks ){ // Itera las tareas
    await Note.deleteMany({ task: task.id }) // Con base en el id de la tarea, elimina las notas que tenga la tarea
  }

  await Task.deleteMany({ project: projectId }) // Si existe el projecto, elimina las tareas
})

const Porject = mongoose.model<IProject>('Project',ProjectSchema)
export default Porject