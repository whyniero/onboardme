import { authenticate } from "../hooks/authenticate.js";
import { addStage, deleteStage, getStage, getStages, updateStage, getStagesForIntern, } from "../controllers/stageController.js";
export default async function (app) {
    app.get("/", { handler: getStages });
    app.get("/:id", { handler: getStage });
    app.get("/interns/:internId", { handler: getStagesForIntern });
    app.post("/", { handler: addStage, preHandler: authenticate });
    app.delete("/:id", { handler: deleteStage, preHandler: authenticate });
    app.put("/:id", { handler: updateStage, preHandler: authenticate });
}
