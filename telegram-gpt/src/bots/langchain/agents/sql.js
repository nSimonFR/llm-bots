import { createSqlAgent, SqlToolkit } from "langchain/agents";
import { SqlDatabase } from "langchain/sql_db";

const metabaseDatasource = async () => {
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
  const sessionToken = process.env.METABASE_SESSION_TOKEN;

  const query = async (query) => {
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

    const sqlJson = await sqlRes.json();

    const rows = sqlJson.data.rows.map((r) =>
      Object.fromEntries(r.map((e, i) => [sqlJson.data.cols[i].name, e]))
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
  };
};

export const GPTSQL = async (model, input) => {
  const datasource = await metabaseDatasource();
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
    sampleRowsInTableInfo: 1,
  });
  const toolkit = new SqlToolkit(db);
  const executor = createSqlAgent(model, toolkit, { topK: 1 });

  const result = await executor.call({ input });
  return [
    `Final Result: ${result.output}`,
    "",
    "SQL Queries ran:",
    ...result.intermediateSteps
      .filter((s) => s.action.tool === "query-sql")
      .map((s) => "```" + s.action.toolInput + "```"),
  ].join("\n");
};

export default GPTSQL;
