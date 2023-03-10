const express = require("express");
const {
  ASSET_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../assets/constants");
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const db = require("../db");
const {
  fetchAssets,
  fetchAssetById,
  updateAssetById,
  updateLocalAsset,
} = require("../middleware/asset");
const { isAdmin, checkValidationResult } = require("../middleware/auth");
const {
  checkEditUpdate,
  checkAll,
  checkAdd,
  checkEditAdmin,
} = require("../middleware/routing");
const { check } = require("express-validator");

const ensureLoggedIn = ensureLogIn();

const router = express.Router();

router.get(
  "/all/closed",
  ensureLoggedIn,
  fetchAssets,
  function (req, res, next) {
    res.locals.assets = res.locals.assets.filter(function (asset) {
      return asset.closed;
    });
    res.render("index", { user: req.user, showAllClosed: true });
  }
);

router.get("/all", ensureLoggedIn, fetchAssets, function (req, res, next) {
  res.locals.assets = res.locals.assets.filter(function (asset) {
    return !asset.closed;
  });
  res.render("index", { user: req.user, showAll: true });
});

router.get("/add", ensureLoggedIn, updateLocalAsset, function (req, res, next) {
  res.render("index", { user: req.user, addNew: true });
});

router.post(
  "/add",
  ensureLoggedIn,
  check("name", ERROR_MESSAGES.ADD_ISSUE.NAME).isLength({ min: 1 }),
  check("code", ERROR_MESSAGES.ADD_ISSUE.CODE).isLength({ min: 6, max: 6 }),
  check("note", ERROR_MESSAGES.ADD_ISSUE.NOTE).isLength({ min: 3, max: 200 }),
  checkValidationResult,
  function (req, res, next) {
    const today = new Date().toISOString();
    db.run(
      "INSERT INTO assets (owner_id, owner_name, created, updated, name, code, type, status, note, closed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        req.user.username,
        today,
        today,
        req.body.name,
        req.body.code,
        req.body.type,
        ASSET_STATUS.OPEN,
        req.body.note ?? null,
        req.body.closed == true ? 1 : null,
      ],
      function (err) {
        if (err) {
          return next(err);
        }
      }
    );
    return res.redirect("/all");
  }
);

router.post("/", ensureLoggedIn, checkAll, checkAdd);

router.get(
  "/:id(\\d+)/edit",
  ensureLoggedIn,
  fetchAssetById,
  updateLocalAsset,
  function (req, res, next) {
    return res.render("index", { user: req.user, edit: true });
  }
);

router.get(
  "/:id(\\d+)/view",
  ensureLoggedIn,
  updateAssetById,
  fetchAssetById,
  function (req, res, next) {
    return res.render("index", { user: req.user, readOnly: true });
  }
);

router.post(
  "/:id(\\d+)/view",
  ensureLoggedIn,
  fetchAssetById,
  function (req, res, next) {
    res.render("index", { user: req.user, readOnly: true });
  }
);

router.post(
  "/:id(\\d+)/delete",
  ensureLoggedIn,
  isAdmin,
  function (req, res, next) {
    db.run(
      "DELETE FROM assets WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
      function (err) {
        if (err) {
          return next(err);
        }
        req.session.messages = [SUCCESS_MESSAGES.DELETED];
        req.session.msgTone = "positive";
        return res.redirect("/all/closed");
      }
    );
  }
);

// we could validate type but not needed for v1.0.0
router.post(
  "/:id(\\d+)/edit",
  ensureLoggedIn,
  check("name", ERROR_MESSAGES.ADD_ISSUE.NAME).isLength({ min: 1 }),
  check("code", ERROR_MESSAGES.ADD_ISSUE.CODE).isLength({ min: 6, max: 6 }),
  check("note", ERROR_MESSAGES.ADD_ISSUE.NOTE).isLength({ min: 3, max: 200 }),
  checkValidationResult,
  checkEditUpdate,
  isAdmin,
  checkEditAdmin,
  function (req, res, next) {
    db.run(
      "DELETE FROM assets WHERE id = ? AND owner_id = ?",
      [req.params.id, req.user.id],
      function (err) {
        if (err) {
          return next(err);
        }
        req.session.messages = [SUCCESS_MESSAGES.DELETED];
        req.session.msgTone = "positive";
        return res.redirect("/all");
      }
    );
  }
);

router.get("/settings", ensureLoggedIn, function (req, res, next) {
  res.render("settings", { user: req.user });
});

module.exports = router;
