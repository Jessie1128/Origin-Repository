from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
load_dotenv("mydb.evn")
app = Flask(__name__, static_folder="static", static_url_path="/")
app.config["TEMPLATES_AUTO_RELOAD"] = True

mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()


@ app.route("/")
def index():
    return render_template("index.html")


@ app.route("/attraction/<id>")
def attraction(id):
    ValuesKeys = "id, name, category, description, address, transport, mrt, latitude, longitude, images"
    sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions WHERE NUM= %s;"
    mycursor.execute(sqlSelect, (id,))
    myresult = mycursor.fetchone()
    # ---------
    try:
        if myresult == None:
            error = {}
            error["error"] = True
            error["message"] = "景點編號錯誤"
            return (error, 400)
        else:
            values = {}
            for num in range(len(myresult)):
                columnName = mycursor.description[num][0]
                columnValue = myresult[num]
                values[columnName] = columnValue
            valuesImagesSplitHTTP = values["images"].split(",")
            values["images"] = valuesImagesSplitHTTP
        # --------
            response = {}
            response["data"] = values
            return response
    except:
        error = {}
        error["error"] = True
        error["message"] = "伺服器內部錯誤"
        return (error, 500)
    return render_template("attraction.html")


@ app.route("/attractions")
def attractions():
    page = request.args.get("page", 0, type=int)
    keyword = request.args.get("keyword", None)
    ValuesKeys = "id, name, category, description, address, transport, mrt, latitude, longitude, images"
    # -------------

    def howManyData(myresult):
        # values = {}
        valuesList = []
        for infoNum in range(len(myresult)):
            info = myresult[infoNum]
            values = {}
            for num in range(len(info)):
                # values = {}
                columnName = mycursor.description[num][0]
                columnValue = info[num]
                values[columnName] = columnValue
            valuesImagesSplitHTTP = values["images"].split(",")
            values["images"] = valuesImagesSplitHTTP
            valuesList.append(values)
        return valuesList
    # -----------
    try:
        if keyword == None:
            print("執行這邊")
            sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions LIMIT %s,%s;"
            mycursor.execute(sqlSelect, (page*12, 13))
            myresult = mycursor.fetchall()
            values = howManyData(myresult)
            # print("執行這邊")
        # --------
            response = {}
            if len(myresult) > 12:
                values.pop(12)
                response["nextPage"] = page+1
                response["data"] = values
                return response
            else:
                response["nextPage"] = "null"
                response["data"] = values
                return response
        else:
            print("執行這邊")
            sqlSelect = "SELECT "+ValuesKeys + \
                " FROM Attractions WHERE NAME LIKE '%" + keyword+"%' LIMIT %s,%s;"
            # print(sqlSelect)
            mycursor.execute(sqlSelect, (page*12, (page+1)*13))
            myresult = mycursor.fetchall()
            myresult = list(myresult)
            # print(myresult)
            values = howManyData(myresult)
            # print("values", values)
            # --------------
            response = {}
            if myresult == []:
                error = {}
                error["error"] = True
                error["message"] = "超過總頁數"
                return (error, 400)
            elif len(myresult) < 13:
                response["nextPage"] = "null"
                response["data"] = values
                return response
            else:
                values.pop(12)
                response["nextPage"] = page+1
                response["data"] = values
                return response
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
