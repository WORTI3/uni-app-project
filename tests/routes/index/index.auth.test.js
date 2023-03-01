const request = require("supertest");
const cheerio = require('cheerio');
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const app = require("../../../src/app");

jest.mock('connect-ensure-login', () => ({
  ensureLoggedIn: jest.fn(() => (req, res, next) => next()),
}));

afterEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

describe("GET /add", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/add").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/add").expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h3').text();
    expect(heading).toBe('Raise a new ticket');
    expect($('a').length).toBe(3);
  });
});

describe("GET /settings", () => {
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get("/settings").expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render add content", async () => {
    const result = await request(app).get("/settings").expect(200);

    const $ = cheerio.load(result.text);
    expect($('p').length).toBe(4);
    expect($('a').length).toBe(6);
  });
});


