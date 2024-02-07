const Expense = require("../models/expense");
const Users = require("../models/sign-up");
const sequelize = require("../util/database");
const S3Services = require("../services/s3services");
const UserServices = require("../services/userservices");


exports.showLeaderBoard = async (req, res) => {
  try {
    const leaderBoardOfUsers = await Users.findAll({
      attributes: ["id", "name", [sequelize.fn('sum',sequelize.col('expenses.amount')),"totalExpenses"]],
      include: [
        {
        model : Expense,
        attributes:[]
        }
      ],
      group:['id'],
      order: [["totalExpenses", "DESC"]],
    });
    

    res.status(200).json(leaderBoardOfUsers);
  } catch (error) {
    res.status(403).json({ error: error });
    console.log(error);
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    const expenses = await UserServices.getExpenses(req);
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;
    const filename = `Expenses${userId}/${new Date()}.txt`;
    console.log(123456);
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    console.log(fileURL);
    await req.user.createFileurl({ url: fileURL });
    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    res.status(500).json({ fileURL: "", success: false, message: error });
  }
};

exports.getAllDownloadHistory = async (req, res) => {
  try {
    const downloadHistory = await UserServices.getAllDownloadHistory(req);
    res.status(200).json({ downloadHistory, success: true });
  } catch (error) {
    res.status(500).json({ message: error, success: false });
  }
};
