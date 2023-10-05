import { User as ModelUser } from "@/models";
import { db } from "./";
import bcryptjs from "bcryptjs";
import { User } from "next-auth";

export const checkUserEmailPassword = async (
  email: string,
  password: string
) => {
  await db.connect();
  const user = await ModelUser.findOne({ email });
  await db.disconnect();

  if (!user) return null;
  if (!bcryptjs.compareSync(password, user.password!)) return null;

  const { role, name, _id } = user;

  return {
    _id,
    email: email.toLocaleLowerCase(),
    role,
    name,
    id: _id,
  } as User;
};

export const oAUthToDbUser = async (oAuthEmail: string, oAuthName: string) => {
  await db.connect();
  const user = await ModelUser.findOne({ email: oAuthEmail });

  if (user) {
    await db.disconnect();
    const { _id, name, email, role } = user;
    return { _id, name, email, role };
  }

  const newUser = new ModelUser({
    email: oAuthEmail,
    name: oAuthName,
    password: "@",
    role: "client",
  });
  await newUser.save();
  await db.disconnect();

  const { _id, name, email, role } = newUser;
  return { _id, name, email, role };
};
