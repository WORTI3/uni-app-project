const request = require("supertest");
const cheerio = require('cheerio');
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const app = require("../../../src/app");
const { fetchAssetsForAdmin, fetchAssets, fetchAssetById, updateAssetById} = require("../../../src/middleware/asset");

jest.mock('connect-ensure-login', () => ({
  ensureLoggedIn: jest.fn(() => (req, res, next) => next()),
}));

jest.mock('../../../src/middleware/asset', () => ({
  fetchAssetsForAdmin: jest.fn(),
  fetchAssets: jest.fn(),
  fetchAssetById: jest.fn(),
  updateAssetById: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
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

describe("GET /1/edit", () => {
  const id = 1;
  const url = '/' + id + '/edit';
  fetchAssetById.mockImplementation((req, res, next) => {
    res.locals.asset = { id: 1, name: "test asset" };
    next();
  });
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get(url).expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render edit content with correct ID", async () => {
    const result = await request(app).get(url).expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h3').text();
    expect(heading).toBe('Editing asset: #' + id);
    expect($('a').length).toBe(3);
  });
});

describe("GET /1/view", () => {
  const id = 1;
  const url = '/' + id + '/view';
  updateAssetById.mockImplementation((req, res, next) => next());
  fetchAssetById.mockImplementation((req, res, next) => {
    res.locals.asset = { id: 1, name: "test asset" };
    next();
  });
  it("should return 200 status code match snapshot", async () => {
    const result = await request(app).get(url).expect(200);
    expect(result.get('Content-Type')).toContain('text/html');
    expect(result.text).toMatchSnapshot();
  });

  it("should render view content with correct ID", async () => {
    const result = await request(app).get(url).expect(200);

    const $ = cheerio.load(result.text);
    const heading = $('h3').text();
    expect(heading).toBe('Viewing asset: #' + id);
    expect($('a').length).toBe(3);
  });
});
