export async function authenticate(request, reply) {
    try {
        const payload = await request.jwtVerify();
        request.user = {
            id: payload.userId,
            role: payload.role,
            email: payload.email,
        };
    }
    catch (err) {
        return reply.status(401).send({ message: "Unauthorized" });
    }
}
