const { describe, it } = require("node:test");
const assert = require("node:assert");
const { NtunhsAuthHandler } = require("../models/users/School_Auth");
const ntunhsConfig = require("../models/NTUNHS/config");

describe("portfolio login", () => {
    it("should login successful", async () => {
        let ntunhsAuthHandler = new NtunhsAuthHandler({ session: {} });
        let authResult = await ntunhsAuthHandler.portfolioAuth(ntunhsConfig.stuNum, ntunhsConfig.stuPwd);
        console.log(authResult);
    })
});