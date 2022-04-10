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


@booking.route("/booking", methods=['GET', 'POST', 'DELETE'])
def bookingPage():
    # ================================================================================= GET
    if request.method == 'GET':
        try:
            cookie_token = request.cookies.get("user_token")
            if cookie_token == None:
                return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
            else:
                cookie_token = cookie_token.replace('"user_token"=', "")
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                email = jwt_decode["email"]
                mycursor.execute(
                    """SELECT `attraction-id`,`date`,`price`,`time` FROM `pending-order` WHERE `EMAIL`=%s""", (email,))
                sqlResult = mycursor.fetchone()
                if sqlResult == None:
                    return jsonify({"data": None}), 200
                else:
                    mycursor.execute(
                        """SELECT NAME,ADDRESS,IMAGES FROM Attractions WHERE `id`= %s""", (sqlResult[0],))
                    info = mycursor.fetchone()
                    return jsonify({
                        "data": {
                            "attraction": {
                                "id": sqlResult[0],
                                "name": info[0],
                                "address": info[1],
                                "image": info[2].split(",")[0]
                            },
                            "date": sqlResult[1].strftime('%Y-%m-%d'),
                            "price": sqlResult[2],
                            "time": sqlResult[3]
                        }
                    }
                    ), 200
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
    # ================================================================================= POST
    if request.method == 'POST':
        try:
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
                cookie_token = cookie_token.replace('"user_token"=', "")
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                email = jwt_decode["email"]
                mycursor.execute(
                    """SELECT COUNT(%s) FROM `pending-order` WHERE `email`=%s""", (email, email,))
                sqlResult = mycursor.fetchone()
                if sqlResult[0] >= 1:
                    mycursor.execute(
                        """DELETE FROM `pending-order` WHERE `email` = %s""", (email,))
                sqlInsert = "INSERT INTO `pending-order` (`email`,`attraction-id`,`date`,`price`,`time`) VALUES (%s,%s,%s,%s,%s)"
                mycursor.execute(
                    sqlInsert, (email, attractionId, date, price, time,))
                mydb.commit()
                return jsonify({"ok": True}), 200
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
    # ================================================================================= PATCH
    if request.method == 'DELETE':
        try:
            cookie_token = request.cookies.get("user_token")
            req = request.get_json()
            print(req["id"])
            if cookie_token == None:
                return jsonify({"error": True, "message": "未登入系統，拒絕存取"}), 403
            else:
                cookie_token = cookie_token.replace('"user_token"=', "")
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                email = jwt_decode["email"]
                mycursor.execute(
                    """DELETE FROM `pending-order` WHERE `email` = %s and `attraction-id` = %s""", (email, req["id"],))
                mydb.commit()
                return jsonify({"ok": True}), 200
        except:
            return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
