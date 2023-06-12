/* eslint-env jest */
import * as dotenv from "dotenv";

dotenv.config();

import getModel from "../src/utils/model";
import { agent } from "../src/agents/sql";

import type { BaseChain } from "langchain/chains";

let executor: BaseChain;
beforeAll(async () => {
  executor = await agent(getModel("test-sql"));
});

test(`Ask log_order count question => Works`, async () => {
  const input = `How many log_order have been created on the 2022-02-01 ?`;
  const result = await executor.call({ input });

  expect(result.output).toMatch(/1237/i);
});
