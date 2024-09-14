import bcrypt from "bcryptjs"

export const encrypt = async (textPlain: string) => {
    const hash = await bcrypt.hash(textPlain, 10)
    return hash
}

export const compare = async (passwordPlain: string, hashPassword: string) => {
    return await bcrypt.compare(passwordPlain, hashPassword)
}