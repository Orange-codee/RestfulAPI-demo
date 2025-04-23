const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Student = require("./models/student");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/exampleDB");
  console.log("成功連結mongoDB");
}

app.get("/students", async (req, res) => {
  try {
    const studentData = await Student.find().exec();
    return res.send(studentData);
  } catch (e) {
    return res.status(500).send("尋找資料時發生錯誤");
  }
});

app.get("/students/:_id", async (req, res) => {
  const { _id } = req.params;
  try {
    const foundedStudent = await Student.findOne({
      _id,
    }).exec();
    return res.send(foundedStudent);
  } catch (error) {
    return res.status(500).send("尋找資料時發生錯誤");
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, age, major, merit, other } = req.body;
    const newStudent = new Student({
      name,
      age,
      major,
      scholarship: { merit, other },
    });
    const savedStudent = await newStudent.save();
    return res.send({
      msg: "資料儲存成功",
      savedObject: savedStudent,
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.put("/students/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const { name, age, major, merit, other } = req.body;

    const newData = await Student.findOneAndUpdate(
      { _id },
      { name, age, major, scholarship: { merit, other } },
      {
        new: true,
        runValidators: true,
        overwrite: true,
        // 因HTTP的put req要求客戶端提供所有數據，所以我們需要根據客戶端提供的數據來更新資料庫內的資料
      }
    );

    return res.send({ msg: "成功更新資料", updatedData: newData });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// class NewData {
//   constructor() {}
//   setProperty(key, value) {
//     if (key !== "merit" && key !== "other") {
//       this[key] = value;
//     } else {
//       this[`scholarship.${key}`] = value;
//     }
//   }
// }
// app.patch("/students/:_id", async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const newObject = new NewData();
//     for (let property in req.body) {
//       newObject.setProperty(property, req.body[property]);
//     }
//     const newData = await Student.findOneAndUpdate({ _id }, newObject, {
//       new: true,
//       runValidators: true,
//       // 不能寫overwrite : true
//     });

//     return res.send({ msg: "成功更新部分資料", updatedData: newData });
//   } catch (error) {
//     return res.status(400).send(error.message);
//   }
// });
// 或者以下寫法
app.patch("/students/:_id", async (req, res) => {
  try {
    let { _id } = req.params;
    let { name, age, merit, other } = req.body;

    let newData = await Student.findByIdAndUpdate(
      { _id },
      {
        name,
        age,
        "scholarship.merit": merit,
        "scholarship.other": other,
      },
      {
        new: true,
        runValidators: true,
        // 不能寫overwrite: true
      }
    );
    return res.send({ msg: "成功更新學生資料!", updatedData: newData });
  } catch (e) {
    return res.status(400).send(e.message);
  }
});

app.delete("/students/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    const deleteResult = await Student.deleteOne({ _id });
    return res.send(deleteResult);
  } catch (e) {
    return res.status(500).send("無法刪除該筆資料");
  }
});

app.listen(3000, () => {
  console.log("伺服器正在聆聽port 3000");
});
