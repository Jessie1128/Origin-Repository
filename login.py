from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
from datetime import datetime, timedelta
import jwt
# app.config['PROPAGATE_EXCEPTIONS'] = True

load_dotenv("mydb.evn")
# ========================================================================== blue print
login = Blueprint("login", __name__)
# ========================================================================== mydb connection
mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()
# ========================================================================== jwt token
# user_token = jwt.encode(
#     {"myproject": "Origin-RepositoryByJessie"}, "Origin-RepositoryByJessie", algorithm="HS256")
# print("JWT", user_token)
# print(jwt.decode(user_token,
#       "Origin-RepositoryByJessie", algorithms=["HS256"]))
# ==========================================================================login
# key = "Origin-RepositoryByJessie"


@login.route("/user", methods=['GET', 'POST', 'PATCH', 'DELETE'])
def loginPage():
    # info = {}
    # try:
    # ================================================================================= GET
    if request.method == 'GET':
        cookie_token = request.cookies.get("user_token")
        print("cookie_token", cookie_token)
        if cookie_token == None:
            return jsonify({"data": None}), 200
        else:
            try:
                cookie_token = cookie_token.replace('"user_token"=', "")
                print(cookie_token)
                jwt_decode = jwt.decode(
                    cookie_token, os.getenv("key"), algorithms=["HS256"])
                print(jwt_decode)
                email = jwt_decode["email"]
                sqlSelect = "SELECT ID,NAME,EMAIL FROM member WHERE `EMAIL`=%s"
                mycursor.execute(sqlSelect, (email,))
                myresult = mycursor.fetchone()
                return jsonify({"data": {"id": myresult[0], "name": myresult[1], "email": myresult[2]}}), 200
            except Exception as e:
                print("error message", e)
                error_message = '{}'.format(e)
                return jsonify({"data": None}), 400
    # ================================================================================= POST
    if request.method == 'POST':
        req = request.get_json()
        name = req["name"]
        email = req["email"]
        password = req["password"]
        sqlSelect = "SELECT * FROM member WHERE `EMAIL`=%s"
        mycursor.execute(sqlSelect, (email,))
        myresult = mycursor.fetchone()
        if myresult == None:
            sqlInsert = "INSERT INTO member (NAME, EMAIL, PASSWORD) VALUES (%s, %s, %s)"
            mycursor.execute(sqlInsert, (name, email, password,))
            mydb.commit()
            payload = {
                "exp": datetime.now() + timedelta(minutes=60),
                "email": email
            }
            user_token = jwt.encode(
                payload, os.getenv("key"), algorithm="HS256")
            # ==============
            res = make_response(
                jsonify({"ok": True, "user_token": user_token}), 200)
            res.set_cookie('user_token', value=user_token, samesite="Lax")
            return res
        else:
            return jsonify({"error": True, "message": "註冊失敗，重複的 Email 或其他原因"}), 400
    # ================================================================================= PATCH
    if request.method == 'PATCH':
        req = request.get_json()
        print("req", req)
        email = req["email"]
        password = req["password"]
        sqlSelect = "SELECT * FROM member WHERE `EMAIL`=%s and `PASSWORD`=%s"
        mycursor.execute(sqlSelect, (email, password))
        myresult = mycursor.fetchone()
        print("myresult", myresult)
        if myresult == None:
            return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"}), 400
        else:
            payload = {
                "exp": datetime.now() + timedelta(minutes=60),
                "email": email
            }
            user_token = jwt.encode(
                payload, os.getenv("key"), algorithm="HS256")
            print("'user_token'", user_token)
            print("'user_token'type", type(user_token))
            # ==============
            res = make_response({"ok": True, "user_token": user_token}, 200)
            res.set_cookie('user_token', value=user_token, samesite="Lax")
            print("res", res)
            print("restype", type(res))
            return res
    # ================================================================================= DELETE
    if request.method == 'DELETE':
        cookie_token = request.headers.get("cookie")

        # res = make_response(
        #     jsonify({"ok": True}), 200)
        # res.set_cookie('user_token', value='', max_age=0)
        resp = make_response(
            jsonify({"ok": True}), 200)
        # resp = Response('delete cookies',)
        resp.delete_cookie('user_token', path='/')
        # resp.set_cookie('user_token', expires=0)
        print("cookie_token", cookie_token)
        print("登出")
        return resp
        # return jsonify({"ok": True}), 200
    # ================================================================================= except
    # except:
    #     return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
