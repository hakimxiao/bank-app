'use server';

import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite";
import { ID } from "node-appwrite";
import { parseStringify } from "../utils";

export const signIn = async() => {
    try {
        // mmutation / database / make fetch
    } catch (error) {
        console.log("Error", error);
    }
}

export const signUp = async(userData: SignUpParams) => {
    const { email, firstName, lastName, password } = userData;

    let newUserAccount;

    try {
      const { account, database } = await createAdminClient();

      newUserAccount = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`
      );

      if (!newUserAccount) throw new Error("Error creating user");

      const session = await account.createEmailPasswordSession(email, password);

      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      return parseStringify(newUserAccount);

    } catch (error) {
      console.log(error);

  };
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return parseStringify(user);
  } catch (error) {
    console.log(error)
    return null;
  }
}