import { createTransport } from "nodemailer";
import { errorHelper } from "./utilityHelper.js";

import {
  awsAccessKey,
  awsSecretAccessKey,
  awsRegion,
} from "../config/envConfig.js";
import pkg from "aws-sdk";
import { GLOBAL_CODES } from "../config/globalConfig.js";

const { config, SES } = pkg;

config.update({
  accessKeyId: awsAccessKey,
  secretAccessKey: awsSecretAccessKey,
  region: awsRegion,
});

const sendCodeToEmail = async (email, name, confirmCode, type, req, res) => {
  new Promise(async (resolve, reject) => {
    if (!email || !confirmCode) {
      return res.status(400).send(errorHelper("00005", req)).end();
    }

    const emailTransfer = createTransport({
      SES: new SES({
        apiVersion: "2010-12-01",
      }),
    });

    let body = "";
    //NOTE: You can customize the message that will be sent to the newly registered users according to your pleasure.
    if (type == "register") {
      body = `${GLOBAL_CODES["welcomeCode"]} ${name}!\r\n\r\n${GLOBAL_CODES["verificationCodeBody"]} ${confirmCode}`;
    } else {
      body = `${GLOBAL_CODES["verificationCodeBody"]} ${confirmCode}`;
    }

    const emailInfo = {
      from: "info@(APPNAME).com",
      to: email,
      subject: GLOBAL_CODES["verificationCodeTitle"],
      text: body,
    };

    try {
      await emailTransfer.sendMail(emailInfo);
      return resolve("Success");
    } catch (err) {
      return reject(err);
    }
  });
};

export { sendCodeToEmail };
