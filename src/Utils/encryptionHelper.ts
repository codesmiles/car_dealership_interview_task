import bcrypt from "bcryptjs";
import jwt, {JwtPayload} from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

export const generateHash = async (value: string) => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(value, salt);
};

export const signJwt = (
	data: object,
	expires = 24 * 60 * 60 * 60
) => {
	return jwt.sign(data, JWT_SECRET, {
		expiresIn: expires,
	});
};

export const checkJwt = (hash: string): JwtPayload | string => {
    const token = jwt.verify(hash, JWT_SECRET);
    return token;
}

export const comparePassword = async (hash: string, textToCompare: string) => {
	const isMatch = await bcrypt.compare(textToCompare, hash);
	return isMatch;
};
