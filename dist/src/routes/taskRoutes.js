import { authenticate } from "../hooks/authenticate.js";
import { addTask, deleteTask, getTask, getTasks, updateTask, updateTaskStatus, } from "../controllers/taskController.js";
export default async function (app) {
    app.get("/:stageId/tasks", { handler: getTasks });
    app.get("/:stageId/tasks/:id", { handler: getTask });
    app.post("/:stageId/tasks", { handler: addTask, preHandler: authenticate });
    app.post("/:stageId/tasks/:id/status", {
        handler: updateTaskStatus,
        preHandler: authenticate,
    });
    app.delete("/:stageId/tasks/:id", {
        handler: deleteTask,
        preHandler: authenticate,
    });
    app.put("/:stageId/tasks/:id", {
        handler: updateTask,
        preHandler: authenticate,
    });
}
