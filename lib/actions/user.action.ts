'use server';

import { cookies } from "next/headers";
import { createAdminClient, createSessionClient } from "../appwrite";
import { ID, Query } from "node-appwrite";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const signIn = async({email, password}: signInProps) => {
    try {
    const { account } = await createAdminClient();
    
    const response = await account.createEmailPasswordSession(email, password);

    return parseStringify(response);
  } catch (error) {
    console.error('Error', error);
  }
}

export const signUp = async(userData: SignUpParams) => {
  const {email, password, firstName, lastName} = userData;

   try{
    const {account} = await createAdminClient();
    const newUserAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

    const session = await account.createEmailPasswordSession(email, password);
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true
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

export const logoutAccount = async () => {
  try {
    const {account} = await createSessionClient();
    cookies().delete("appwrite-session");
    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
}

// PLAID
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: user.name,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({linkToken: response.data.link_token});
  } catch (error) {
    console.log(error);
  }
}

export const exchangePublicToken = async({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // exchange public token for accesss token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // get account information from plaid using the access token
    const accountResponse = await plaidClient.accountsGet({
      access_token: accessToken
    });

    const accountData = accountResponse.data.accounts[0];

    // create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await createFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name
    });

      // if the funding source URL is not created, throw an error
    if(!fundingSourceUrl) throw Error;

    // create a bank account using the user ID, item ID, account ID, access token, funding source URTL, and sherable ID
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharableId: encryptId(accountData.account_id)
    });

    // revalidate the path to reflect the change
    revalidatePath("/");

    // return a success message
    return parseStringify({
      publicTokenExchange: "complete"
    });
  } catch (error) {
    console.log('Terjadi sebuah error ketika sedang membuat exchangePublicToken', error);
  }
}