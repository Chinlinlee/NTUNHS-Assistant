const { describe, it } = require("node:test");
const assert = require("node:assert");
const { NtunhsAuthHandler } = require("../models/users/School_Auth");

describe("portfolio login", () => {
    it("should login successful", async () => {
        let ntunhsAuthHandler = new NtunhsAuthHandler({ session: {} });
        let authResult = await ntunhsAuthHandler.portfolioAuth("062214211", "a9TA4oNS");
        console.log(authResult);
    })
});