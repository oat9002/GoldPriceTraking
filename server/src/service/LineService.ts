import axios from "axios";
// import Client = require("@line/bot-sdk").Client;
import moment from "moment-timezone";
import qs from "qs";
import * as db from "../dal/db";
import * as utils from "../util/utils";

// const client = new Client({
//     channelAccessToken: process.env.OFFICIAL_ACCOUNT_CHANNEL_ACCESS_TOKEN,
//     channelSecret: process.env.OFFICIAL_ACCOUNT_CHANNEL_SECRET,
// });

const monthName = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ษ.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
];
let first = true;

export async function pushMessage() {
    const dbInstance = db.getInstance();
    dbInstance
        .ref("price")
        .orderByChild("created_at")
        .limitToLast(1)
        .on("child_added", async (snapshot) => {
            if (!first) {
                try {
                    const data = snapshot.val();
                    const messageNotify = generateMessage(data);

                    // Stop using line official account
                    // const message = await generateMessage(data, true);
                    // const users = await db.getAllUser();

                    // if (users !== null) {
                    //     Object.keys(users).forEach(key => {
                    //         client.pushMessage(users[key].id, {
                    //             type: "text",
                    //             text: message
                    //         });
                    //     });
                    // }

                    await lineNotify(
                        process.env.NOTIFY_GOLD_PRICE_TRACKING,
                        messageNotify
                    );
                    // client.pushMessage('U192446f179afffe5d1cf02c27125081e', { type: 'text', text: message }); // Test pushMessage
                } catch (err) {
                    console.log(err.stack);
                }
            } else {
                first = false;
            }
        });
}

// async function replyMessage(replyToken: string) {
//     const data = await db.getLatestPrice();
//     const message = generateMessage(data, true);

//     client.replyMessage(replyToken, {
//         type: "text",
//         text: message,
//     });
// }

export function generateMessage(firebaseData: any): string {
    const date = moment(firebaseData.created_at).tz("Asia/Bangkok");
    let showMinute = "" + date.minute();
    if (date.minute() < 10) {
        showMinute = "0" + date.minute();
    }

    const dateMessage =
        "วันที่ " +
        date.date() +
        " " +
        monthName[date.month()] +
        " " +
        (date.year() + 543) +
        " เวลา " +
        date.hour() +
        ":" +
        showMinute +
        " น.\n";
    const priceMessage =
        "ราคารับซื้อ: " +
        addCommaToNumber(firebaseData.buy) +
        " บาท\n" +
        "ราคาขาย: " +
        addCommaToNumber(firebaseData.sell) +
        " บาท";
    let priceDiffMessage = "เทียบราคาจากครั้งก่อน: ";
    if (firebaseData.buyDifferent > 0) {
        priceDiffMessage =
            priceDiffMessage +
            "+" +
            addCommaToNumber(firebaseData.buyDifferent) +
            " บาท";
    } else {
        priceDiffMessage =
            priceDiffMessage +
            addCommaToNumber(firebaseData.buyDifferent) +
            " บาท";
    }
    let message = dateMessage + "\n" + priceMessage + "\n" + priceDiffMessage;
    message += "\n" + "ดูประวัติ https://goldpricetracking.web.app/";

    return message;
}

export function addCommaToNumber(number: number): string {
    return Number(number).toLocaleString("th-TH");
}

export async function addUser(userId: string): Promise<void> {
    try {
        await db.addLineUser(userId);
    } catch (err) {
        utils.log(`addUser failed for userId: ${userId}`, err);
    }
}

export async function lineNotify(
    token: string | undefined,
    message: string
): Promise<void> {
    if (!token) {
        return;
    }

    await axios
        .post(
            "https://notify-api.line.me/api/notify",
            qs.stringify({
                message,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .catch((err) => utils.log("line notify failed", err));
}
