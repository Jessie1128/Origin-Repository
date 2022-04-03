from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
from datetime import datetime, timedelta
import jwt
import datetime
# app.config['PROPAGATE_EXCEPTIONS'] = True

load_dotenv("mydb.evn")
# ========================================================================== blue print
booking = Blueprint("booking", __name__)
# ========================================================================== mydb connection
mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()


booking_info = []
# new_info = []


@booking.route("/booking", methods=['GET', 'POST', 'DELETE'])
def bookingPage():
    # try:
    # booking_info = []
    # ================================================================================= GET
    if request.method == 'GET':
        cookie_token = request.cookies.get("user_token")
        print("存起來的get", booking_info)
        # print("booking_info_1", booking_info)
        if cookie_token == None:
            booking_info.clear()
            print("我要刪掉", booking_info)
            return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
        elif booking_info == []:
            return jsonify({"data": None}), 200
        else:
            id = booking_info[0]['attractionId']
            sqlSelect = "SELECT NAME,ADDRESS,IMAGES FROM Attractions WHERE `id`= %s"
            mycursor.execute(sqlSelect, (id,))
            myresult = mycursor.fetchone()
            image = myresult[2].split(",")[0]
            return jsonify({
                "data": {
                    "attraction": {
                        "id": booking_info[0]['attractionId'],
                        "name": myresult[0],
                        "address": myresult[1],
                        "image": image
                    },
                    "date": booking_info[0]["date"],
                    "time": booking_info[0]["time"],
                    "price": booking_info[0]["price"]
                }
            }
            ), 200
    # ================================================================================= POST
    if request.method == 'POST':
        cookie_token = request.cookies.get("user_token")
        req = request.get_json()
        attractionId = req["attractionId"]
        date = req["date"]
        price = req["price"]
        time = req["time"]
        if cookie_token == None:
            return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
        elif attractionId == '' or date == '' or price == '' or time == '':
            return jsonify({"error": True, "message": "建立失敗，輸入不正確或其他原因"}), 400
        elif date <= str(datetime.date.today()):
            return jsonify({"error": True, "message": "建立失敗，輸入不正確或其他原因"}), 400
        else:
            keys = ["attractionId", "date", "price", "time"]
            values = [int(attractionId), date, price, time]
            info = zip(keys, values)
            info = dict(info)
            if booking == []:
                booking_info.append(info)
            else:
                booking_info.clear()
                booking_info.append(info)
            # for i in range(len(booking_info)):
            #     if booking_info[i] == booking_info:
            #         new_info.append(booking_info[i])
            #         print(new_info)
            # booking_info.drop_duplicates()
            print("存起來的", booking_info)
            # print(len(booking_info))
            # print(len(new_info))
            return jsonify({"ok": True}), 200
    # ================================================================================= PATCH
    if request.method == 'DELETE':
        cookie_token = request.cookies.get("user_token")
        if cookie_token == None:
            return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
        else:
            booking_info.clear()
            print("刪掉的", booking_info)
            return jsonify({"ok": True}), 200
    # ================================================================================= except
    # except:
    #     return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
