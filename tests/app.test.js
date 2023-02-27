// const request = require("supertest");
const app = require("../src/app");
const nunjucks = require("nunjucks");

describe("Nunjucks configuration", () => {

  it("should set the view engine to 'njk'", () => {
    expect(app.get("view engine")).toBe("njk");
  });
});
