const { ERROR_MESSAGES } = require("../../src/assets/constants");
const { isAdmin, checkValidationResult } = require("../../src/middleware/auth");
const { validationResult } = require("express-validator");

describe("isAdmin() unit tests", () => {
  const req = {
    isAuthenticated: jest.fn(),
    session: { messages: [] },
    params: { id: 1 },
    user: {},
  };
  const res = { redirect: jest.fn() };
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next if the user is authenticated and has role 1", () => {
    req.isAuthenticated.mockReturnValue(true);
    req.user.role = 1;
    isAdmin(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(req.session.messages).toEqual([]);
  });

  it("should redirect to the edit page with an error message if the user is not authenticated", () => {
    req.isAuthenticated.mockReturnValue(false);
    isAdmin(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/1/edit");
    expect(req.session.messages).toEqual([ERROR_MESSAGES.NO_PERMISSION]);
  });

  it("should redirect to the edit page with an error message if the user is authenticated but does not have role 1", () => {
    req.isAuthenticated.mockReturnValue(true);
    req.user.role = null;
    isAdmin(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.redirect).toBeCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith("/1/edit");
    expect(req.session.messages).toEqual([ERROR_MESSAGES.NO_PERMISSION]);
  });
});

jest.mock("express-validator");

describe("checkValidationResult() unit tests", () => {
  const req = {
    session: {},
    body: {},
    originalUrl: "/example",
  };
  const res = {
    redirect: jest.fn(),
  };
  const next = jest.fn();
  const error = { msg: ERROR_MESSAGES.DEFAULT };

  beforeEach(() => {
    // mock error result
    validationResult.mockReturnValue({
      array: jest.fn(() => [error]),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should call next when no validation errors present", () => {
    // mock no errors
    validationResult.mockReturnValue({
      array: jest.fn(() => []),
    });
    checkValidationResult(req, res, next);
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should redirect when validation errors exist", () => {
    const error = { msg: ERROR_MESSAGES.DEFAULT };
    validationResult.mockReturnValue({
      array: jest.fn(() => [error]),
    });
    checkValidationResult(req, res, next);
    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith("/example");
    expect(req.session.messages).toEqual([ERROR_MESSAGES.DEFAULT]);
  });

  it("should update session variables for username, item, code, and note", () => {
    req.body = {
      username: "testuser",
      item: "testitem",
      assetCode: "12345",
      note: "testnote",
    };
    checkValidationResult(req, res, next);
    expect(req.session.username).toBe("testuser");
    expect(req.session.name).toBe("testitem");
    expect(req.session.code).toBe("12345");
    expect(req.session.note).toBe("testnote");
  });

  it('should replace "/delete" with "/edit" in the URL if it ends with "/delete"', () => {
    req.originalUrl = "/example/delete";
    checkValidationResult(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith("/example/edit");
  });
});
