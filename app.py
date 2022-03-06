from ssl import SSLSocket
from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
# !/usr/bin/python
# -*- coding: utf-8 - *-
load_dotenv("mydb.evn")
app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True

mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()
# host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository"
# Pages


@ app.route("/")
def index():
    return render_template("index.html")


@ app.route("/attraction/<id>")
def attraction(id):
    print("attraction成功")
    sqlSelect = "SELECT * FROM `ATTRACTIONS` WHERE `NUM`= %s;"
    mycursor.execute(sqlSelect, (id,))
    myresult = mycursor.fetchone()
    # ---------
    try:
        if myresult == None:
            error = {}
            error["error"] = True
            error["message"] = "自訂的錯誤訊息"
            return (error, 400)
        else:
            values = {}
            for num in range(len(myresult)):
                columnName = mycursor.description[num][0]
                columnValue = myresult[num]
                values[columnName] = columnValue
            valuesImagesSplitHTTP = values['images'].split(",")
            values["images"] = valuesImagesSplitHTTP
        # --------
            # print(values)
            response = {}
            response["data"] = values
            return response
    except:
        error = {}
        error["error"] = True
        error["message"] = "自訂的錯誤訊息"
        return (error, 500)
    return render_template("attraction.html")


@ app.route("/attractions")
def attractions():
    # ---------------- 計算筆數的函式
    def howMany(string):
        mycursor.execute(string)
        count = mycursor.fetchone()
        count = str(count)
        count = int(count.replace(",", "").replace("(", "").replace(")", ""))
        return count
    # ---------------- 取出資料的函式

    def howManyData(myresult):
        # values = {}
        valuesList = []
        for infoNum in range(len(myresult)):  # len is 12
            info = myresult[infoNum]
            values = {}
            for num in range(len(info)):
                # values = {}
                columnName = mycursor.description[num][0]
                columnValue = info[num]
                values[columnName] = columnValue
            valuesList.append(values)
        return valuesList
    # ----------------
    print("attractionsssssss成功")
    page = request.args.get("page", 0)
    page = int(page)
    pagiN = 12
    keyword = request.args.get("keyword", None)

    # -----------
    try:
        if keyword == None:
            sqlCount = "SELECT COUNT(NUM) FROM `ATTRACTIONS`"
            count = howMany(sqlCount)
            print("成功", count)
            # --------
            sqlSelect = "SELECT * FROM `ATTRACTIONS` LIMIT %s,%s;"
            mycursor.execute(sqlSelect, (page*pagiN, pagiN))
            myresult = mycursor.fetchall()
            myresult = list(myresult)
            finialData = howManyData(myresult)
            # --------
            response = {}
            if count-(page*pagiN) > pagiN:
                response["nextPage"] = page+1
                response["data"] = finialData
                return response
            else:
                response["nextPage"] = "null"
                response["data"] = finialData
                return response
        else:
            sqlCount = "SELECT COUNT(NUM) FROM `ATTRACTIONS` WHERE `STITLE` LIKE '%" + \
                keyword+"%';"
            count = howMany(sqlCount)
            # print("關鍵字比數成功", count)
            # -------------
            sqlSelect = "SELECT * FROM `ATTRACTIONS` WHERE `STITLE` like '%"+keyword+"%';"
            mycursor.execute(sqlSelect,)
            myresult = mycursor.fetchall()
            myresult = list(myresult)
            finialData = howManyData(myresult)
            # print("執行完函式", finialData)
            # --------------
            response = {}
            if page*pagiN < count and count-(page*pagiN) > pagiN:
                response["nextPage"] = page+1
                response["data"] = finialData
                return response
            elif page*pagiN < count and count-(page*pagiN) < pagiN:
                response["nextPage"] = "null"
                response["data"] = finialData
                return response
            else:
                page = str((count//pagiN)+1)
                error = {}
                error["error"] = True
                error["message"] = "最多只到第"+page+"頁"
                return (error, 400)
            # -------------

    except:
        error = {}
        error["error"] = True
        error["message"] = "自訂的錯誤訊息"
        return (error, 500)


@ app.route("/booking")
def booking():
    return render_template("booking.html")


@ app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


app.add_url_rule('/api/attraction/<id>',
                 endpoint="attractions/<id>", view_func=attraction)
app.add_url_rule('/api/attractions', endpoint="attractions",
                 view_func=attractions)
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000)
