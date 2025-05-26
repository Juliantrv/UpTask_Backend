import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
    origin: (origin, callback) => {
        const witheList = [process.env.FRONTEND_URL]
        if(process.argv[2] === '--api') witheList.push(undefined)
        if(witheList.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error('Error de cors'), false)
        }
    },
}
