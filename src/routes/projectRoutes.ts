import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController"
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthotization, taskBelongsToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

// Middleware valida que el usuario este logeado
router.use(authenticate)

router.post('/',
    body('projectName').trim().notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').trim().notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').trim().notEmpty().withMessage('La descripción del proyecto es obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/',
    ProjectController.getAllProjects
)

// Middleware valida que el projecto existe
router.param('projectId',projectExist)

router.get('/:projectId',
    param('projectId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.put('/:projectId',
    param('projectId').isMongoId().withMessage('Id no válido'),
    body('projectName').trim().notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName').trim().notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description').trim().notEmpty().withMessage('La descripción del proyecto es obligatorio'),
    handleInputErrors,
    hasAuthotization,
    ProjectController.updateProject
)

router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    hasAuthotization,
    ProjectController.deleteProject
)

// Routes for task

router.post('/:projectId/task',
    hasAuthotization,
    body('name').trim().notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').trim().notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/task',
    handleInputErrors,
    TaskController.getProjectTask
)

// Middleware valida que la tarea existe
router.param('taskId',taskExist)

// Middleware valida que la tarea pertenesca al proyecto
router.param('taskId',taskBelongsToProject)

router.get('/:projectId/task/:taskId',
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/task/:taskId',
    hasAuthotization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('name').trim().notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description').trim().notEmpty().withMessage('La descripción de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/task/:taskId',
    hasAuthotization,
    param('taskId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/task/:taskId/status',
    param('taskId').isMongoId().withMessage('Id no válido'),
    body('status').trim().notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.uptadeStatus
)

// Routes for teams
router.post('/:projectId/team/find',
    body('email').trim().notEmpty().toLowerCase().withMessage('Email no válido'),
    handleInputErrors,
    TeamMemberController.findMemeberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
    body('id').trim().notEmpty().isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    param('userId').trim().notEmpty().isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

// Routes for notes
router.post('/:projectId/tasks/:taskId/notes',
    body('content').trim().notEmpty().withMessage('El comentario de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    NoteController.deleteNote
)

export default router