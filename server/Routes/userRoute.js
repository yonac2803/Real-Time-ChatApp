const express = require("express");
const { registUser, loginUser, findUser, getUsers } = require("../Controllers/userController");

const router = express.Router();


router.post("/register", registUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUsers);

module.exports = router;