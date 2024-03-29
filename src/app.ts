import configs from "./configs"
import Koa, {Context} from 'koa'
import {bootstrapControllers} from 'koa-ts-controllers'
import KoaRouter from 'koa-router'
import path from "path";
import KoaBodyParser from 'koa-bodyparser'

(async () => {
    const app = new Koa()

    const router = new KoaRouter()

    // 注册路由
    await bootstrapControllers(app, {
        router: router,
        basePath: '/api',
        versions: [1],
        controllers: [
            path.resolve(__dirname, 'controllers/**/*')
        ],
        errorHandler: async (err: any, ctx: Context) => {
            let status = 500
            let body: any = {
                statusCode: status,
                error: "Internal Server error",
                message: "An internal server error occurred"
            }

            if (err.output) {
                status = err.output.statusCode
                body = {...err.output.payload}
                if (err.data) {
                    body.errorDetails = err.data
                }
            }

            ctx.status = status;
            ctx.body = body;
        }
    })

    app.use(KoaBodyParser())
    app.use(router.routes())

    app.listen(configs.server.port, configs.server.host, () => {
        console.log(`服务启动成功: http://${configs.server.host}:${configs.server.port}`)
    })
})()