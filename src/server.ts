import express from "express";
import dotEnv from "dotenv"
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors"
import { connectDB } from "./config/db"
import authRoutes from "./routes/authRoutes"
import projectRoutes from "./routes/projectRoutes"

dotEnv.config()
connectDB()
const app = express()

// Cors
app.use(cors(corsConfig))

app.use(express.json())

// Logging
app.use(morgan('dev'))

// Routes
app.use('/api/auth',authRoutes)
app.use('/api/projects',projectRoutes)

export default app