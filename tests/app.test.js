const app = require("../src/app");

describe("Nunjucks configuration", () => {

  it("should set the view engine to 'njk'", () => {
    expect(app.get("view engine")).toBe("njk");
  });
});
