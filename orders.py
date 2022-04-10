import requests
# from typing import Mapping
from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
from datetime import datetime, timedelta
import jwt
import datetime
import random
# import urllib.request as re
# import urllib.parse
# import ssl
# context = ssl._create_unverified_context()
# app.config['PROPAGATE_EXCEPTIONS'] = True

load_dotenv("mydb.evn")
# ========================================================================== blue print
orders = Blueprint("orders", __name__)
# ========================================================================== mydb connection
mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()


@orders.route("/orders", methods=['GET', 'POST'])
def ordersPage():
    if request.method == 'GET':
        cookie_token = request.cookies.get("user_token")
        if cookie_token == None:
            return jsonify({"data": None}), 403
        else:
            try:
                order_number = request.args.get("number")
                print("order_number", order_number)
                cookie_token = cookie_token.replace('"user_token"=', "")
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                email = jwt_decode["email"]
                print(email)

                mycursor.execute("""SELECT * FROM `confirm-order` join `successful-tran` on `confirm-order`.`order_number` = `successful-tran`.`order_number` where `confirm-order`.`user_email`=%s and `successful-tran`.`order_number` = %s;""",
                                 (email, order_number,))
                sqlResult = mycursor.fetchone()
                if sqlResult == None:
                    print("sqlResult", sqlResult)
                    return jsonify({"data": None}), 200
                else:
                    info = {
                        "data": {
                            "number": sqlResult[6],
                            "price": sqlResult[5],
                            "trip": {
                                "attraction": {
                                    "id": sqlResult[0],
                                    "name": sqlResult[2],
                                    "address": sqlResult[3],
                                    "image": sqlResult[4]
                                },
                                "date": sqlResult[12],
                                "time": sqlResult[13]
                            },
                            "contact": {
                                "name": sqlResult[8],
                                "email": sqlResult[9],
                                "phone": sqlResult[7],
                            },
                            "status": sqlResult[17],
                        }
                    }
                return info, 200
            except Exception as e:
                print("error message", e)
                error_message = '{}'.format(e)
                return jsonify({"data": None}), 400
    if request.method == 'POST':
        try:
            cookie_token = request.headers.get("cookie")
            if cookie_token == None:
                return jsonify({"data": None}), 403
            else:
                # ==============================================
                cookie_token = cookie_token.replace("user_token=", '')
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                email = jwt_decode["email"]
                # ==============================================
                req = request.get_json()
                order_num = datetime.datetime.now().strftime(
                    '%Y%m%d-%H%M%S%f')[:-4]
                order_random = str('{:.5f}'.format(
                    random.uniform(1.0, 10.0))).replace(".", "")
                booked_num = order_num+"-"+order_random
                print(req)
                print("address", req["order"]["trip"]["attraction"]["address"])
                print("image", req["order"]["trip"]["attraction"]["image"])
                mycursor.execute("""INSERT INTO `confirm-order` ( `USER_EMAIL`, `ATTRACTION_NAME`,  `ATTRACTION_ADDRESS`, `ATTRACTION_IMAGE`, `PRICE`, `ORDER_NUMBER`, `BOOKING_PHONE`, `BOOKING_NAME`, `BOOKING_EMAIL`, `ATTRACTION_ID`,`ATTRACTION_DATE`, `ATTRACTION_TIME`,`PAYMENT_STATUS`) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                                 (email, req["order"]["trip"]["attraction"]["name"], req["order"]["trip"]["attraction"]["address"], req["order"]["trip"]["attraction"]["image"], req["order"]["price"], booked_num, req["order"]["contact"]["phone"],
                                  req["order"]["contact"]["name"], req["order"]["contact"]["email"], req["order"]["trip"]["attraction"]["id"], req["order"]["trip"]["date"], req["order"]["trip"]["time"], '未付款'))
                mydb.commit()
                info = {
                    "prime": req["prime"],
                    "partner_key": os.getenv("partner_key"),
                    "merchant_id": os.getenv("merchant_id"),
                    "details": "台北一日遊行程：" + req["order"]["trip"]["attraction"]["name"],
                    "amount": req["order"]["price"],
                    "order_number": booked_num,
                    "cardholder": {
                        "phone_number": req["order"]["contact"]["phone"],
                        "name": req["order"]["contact"]["name"],
                        "email": req["order"]["contact"]["email"],
                        "zip_code": "",
                        "address": "",
                        "national_id": ""
                    },
                    "remember": True,
                }
                # ============================================== api to TapPay
                tap_pay_res = requests.post(
                    'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', json=info, timeout=30, headers={"x-api-key": os.getenv("partner_key")}
                )
                tap_pay_res = tap_pay_res.json()
                print(tap_pay_res["status"])
                if tap_pay_res["status"] == 0:
                    print("付款成功")
                    mycursor.execute("""INSERT INTO `successful-tran` ( `prime`, `status`, `msg`, `amount`, `card_token`, `card_key`, `rec_trade_id`,`bank_transaction_id`, `order_number`,`auth_code`,`transaction_time_millis`) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                                     (req["prime"], tap_pay_res["status"], tap_pay_res["msg"], tap_pay_res["amount"], tap_pay_res["card_secret"]["card_token"], tap_pay_res["card_secret"]["card_key"],
                                      tap_pay_res["rec_trade_id"], tap_pay_res["bank_transaction_id"], tap_pay_res["order_number"], tap_pay_res["auth_code"], tap_pay_res["transaction_time_millis"]))
                    mydb.commit()
                    mycursor.execute(
                        """UPDATE `confirm-order` SET `payment_status` = '已付款' WHERE `order_number` = %s""", (tap_pay_res["order_number"],))
                    mydb.commit()
                    return jsonify({
                        "data": {
                            "number": tap_pay_res["order_number"],
                            "payment": {
                                "status": tap_pay_res["status"],
                                "message": "付款成功"
                            }
                        }
                    }), 200
                else:
                    print("付款失敗")
                    mycursor.execute("""INSERT INTO `failed-tran` ( `prime`, `status`, `msg`, `rec_trade_id`, `bank_result_code`, `order_number`) VALUES (%s,%s,%s,%s,%s,%s)""",
                                     (req["prime"], tap_pay_res["status"], tap_pay_res["msg"], tap_pay_res["rec_trade_id"], tap_pay_res["bank_result_code"], booked_num))
                    mydb.commit()
                    return jsonify({"error": True, "message": "訂單建立失敗，輸入不正確或其他原因", "number": booked_num}), 400
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
