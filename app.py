from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
import jwt
from login import login
from booking import booking
from orders import orders
load_dotenv("mydb.evn")
# ========================================================================== blue print
app = Flask(__name__, static_folder="static", static_url_path="/")
app.register_blueprint(login, url_prefix="/api")
app.register_blueprint(booking, url_prefix="/api")
app.register_blueprint(orders, url_prefix="/api")
# ========================================================================== mydb connection
mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
mycursor = mydb.cursor()
# ========================================================================== jwt token
encoded_jwt = jwt.encode(
    {"myproject": "Origin-RepositoryByJessie"}, "secret", algorithm="HS256")
print("JWT", encoded_jwt)
print(jwt.decode(encoded_jwt, "secret", algorithms=["HS256"]))
# ==========================================================================render_template
app.config["TEMPLATES_AUTO_RELOAD"] = True


@ app.route("/")
def index():
    return render_template("index.html")


@ app.route("/attraction/<id>")
def attraction(id):
    return render_template("attraction.html")


@ app.route("/booking")
def booking():
    return render_template("booking.html")


@ app.route("/thankyou")
def thankyou():
    return render_template("thankyou.html")


# ==========================================================================for api


@ app.route("/api/attraction/<id>")
def attraction_id(id):
    ValuesKeys = "id, name, category, description, address, transport, mrt, latitude, longitude, images"
    sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions WHERE id= %s;"
    mycursor.execute(sqlSelect, (id,))
    myresult = mycursor.fetchone()
    # ---------
    try:
        if myresult == None:
            return jsonify({"error": True, "message": "景點編號錯誤"}), 400
        else:
            values = {}
            for num in range(len(myresult)):
                columnName = mycursor.description[num][0]
                columnValue = myresult[num]
                values[columnName] = columnValue
            valuesImagesSplitHTTP = values["images"].split(",")
            values["images"] = valuesImagesSplitHTTP
        # --------
            return jsonify({"data": values}), 200
    except:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500


@ app.route("/api/attractions")
def attractions():
    page = request.args.get("page", 0, type=int)
    keyword = request.args.get("keyword", None)
    print(page)
    print(keyword)
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
            sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions LIMIT %s,%s;"
            mycursor.execute(sqlSelect, (page*12, 13))
            myresult = mycursor.fetchall()
            values = howManyData(myresult)
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
            sqlSelect = "SELECT "+ValuesKeys + \
                " FROM Attractions WHERE NAME LIKE '%" + keyword+"%' LIMIT %s,%s;"
            # print(sqlSelect)
            mycursor.execute(sqlSelect, (page*12, (page+1)*13))
            myresult = mycursor.fetchall()
            myresult = list(myresult)
            print(myresult)
            values = howManyData(myresult)
            print("values", values)
            # --------------
            response = {}
            if myresult == []:
                print("這邊")
                error = {}
                error["error"] = True
                error["message"] = "超過總頁數 或是 查無資料"
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
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500


# ==========================================================================app.run
    # app.add_url_rule('/api/attraction/<id>',
    #                  endpoint="attractions/<id>", view_func=attraction)
    # app.add_url_rule('/api/attractions', endpoint="attractions",
    #                  view_func=attractions)

# ===================================================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
