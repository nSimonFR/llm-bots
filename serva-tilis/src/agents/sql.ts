import { createSqlAgent, SqlToolkit } from "langchain/agents";
import { SqlDatabase } from "langchain/sql_db";

import { sendMessageToTelegram } from "../chats/telegram/out";
import getModel from "../utils/model";

import type { DataSource } from "typeorm";
import type { BaseLanguageModel } from "langchain/dist/base_language";

export const metabaseDatasource = async (): Promise<DataSource> => {
  const baseURL = process.env.METABASE_URL;

  // TODO Login
  // const sessionRes = await fetch(`${baseURL}/api/session`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     username: process.env.METABASE_USERNAME,
  //     password: process.env.METABASE_PASSWORD,
  //   }),
  // });
  // console.log(await sessionRes.json());

  const sessionToken = process.env.METABASE_SESSION_TOKEN as string;

  const query = async (query: string) => {
    const sqlRes = await fetch(`${baseURL}/api/dataset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Metabase-Session": sessionToken,
      },
      body: JSON.stringify({
        database: 6,
        native: {
          query,
        },
        type: "native",
      }),
    });

    const sqlJson: any = await sqlRes.json();

    const rows = sqlJson.data.rows.map((r: any) =>
      Object.fromEntries(
        r.map((e: any, i: number) => [sqlJson.data.cols[i].name, e])
      )
    );

    return rows;
  };

  return {
    options: {
      type: "postgres",
    },
    isInitialized: true,
    destroy: async () => {},
    query,
  } as DataSource;
};

export const agent = async (model: BaseLanguageModel) => {
  const datasource = await metabaseDatasource();
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
    sampleRowsInTableInfo: 1,
  });
  const toolkit = new SqlToolkit(db);
  const executor = createSqlAgent(model, toolkit, { topK: 1 });

  return executor;
};

export default async (userId: string, username: string, input: string) => {
  const model = getModel(username);

  const executor = await agent(model);

  const result = await executor.call({ input });

  const text = [
    `Final Result: ${result.output}`,
    "",
    "SQL Queries ran:",
    ...result.intermediateSteps
      .filter((s: any) => s.action.tool === "query-sql")
      .map((s: any) => "```" + s.action.toolInput + "```"),
  ].join("\n");

  await sendMessageToTelegram(userId, text);
};
