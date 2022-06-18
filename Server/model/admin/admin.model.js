const Admin = require('./admin.schema')

async function insertAdmin(admin) {
    return Admin.create(admin);
}

let adminExist = function (admin) {
    return new Promise((resolve, reject) => {
      try {
        Admin.findOne({ emailAddress: admin.emailAddress }).then((res) => {
          if (res) {
            console.log("Doctor is found");
            resolve(true);
          } else {
            console.log("Doctor is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };

  let adminExistwithID = function (id) {
    return new Promise((resolve, reject) => {
      try {
        Admin.findOne({ identity: id }).then((res) => {
          if (res) {
            console.log("admin is found");
            resolve(res);
          } else {
            console.log("admin is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };

  let adminExistwithEmail = function (emailAddress) {
    return new Promise((resolve, reject) => {
      try {
        Admin.findOne({ emailAddress: emailAddress }).then((res) => {
          if (res) {
            console.log("admin is found");
            resolve(res);
          } else {
            console.log("admin is not found");
            resolve(false);
          }
        });
      } catch (e) {
        console.log("error while try find the user");
        resolve(false);
      }
    });
  };




module.exports = {
  insertAdmin,adminExist,adminExistwithID,adminExistwithEmail,
}
