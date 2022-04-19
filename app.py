from multiprocessing import Event
from dotenv import load_dotenv
import os
import mysql.connector
from flask import *
import jwt
from login import login
from booking import booking
from orders import orders
from mysql.connector import pooling
from mysql.connector import Error

# from connection_pool import connect_start
load_dotenv("key.evn")
# ========================================================================== blue print
app = Flask(__name__, static_folder="static", static_url_path="/")
app.register_blueprint(login, url_prefix="/api")
app.register_blueprint(booking, url_prefix="/api")
app.register_blueprint(orders, url_prefix="/api")
# ========================================================================== connection pool
connection_pool = pooling.MySQLConnectionPool(pool_name="Origin-pool",
                                              pool_size=5,
                                              pool_reset_session=True,
                                              host="127.0.0.1",
                                              database="OriginRepository",
                                              user=os.getenv(
                                                  "user"),
                                              password=os.getenv("password"))
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
    try:
        connection_objt = connection_pool.get_connection()
        mycursor = connection_objt.cursor()
        # ============================================================
        ValuesKeys = "id, name, category, description, address, transport, mrt, latitude, longitude, images"
        sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions WHERE id= %s;"
        mycursor.execute(sqlSelect, (id,))
        myresult = mycursor.fetchone()
        # ---------
        # try:
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
    finally:
        connection_objt.close()


@ app.route("/api/attractions")
def attractions():
    connection_objt = connection_pool.get_connection()
    mycursor = connection_objt.cursor()
    # ============================================================
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
            sqlSelect = "SELECT "+ValuesKeys+" FROM Attractions LIMIT %s,%s;"
            mycursor.execute(sqlSelect, (page*12, 13))
            myresult = mycursor.fetchall()
            values = howManyData(myresult)
        # --------
            if len(myresult) > 12:
                values.pop(12)
                return jsonify({"nextPage": page+1, "data": values}), 200
            else:
                return jsonify({"nextPage": "null", "data": values}), 200
        else:
            sqlSelect = "SELECT "+ValuesKeys + \
                " FROM Attractions WHERE NAME LIKE '%" + keyword+"%' LIMIT %s,%s;"
            mycursor.execute(sqlSelect, (page*12, (page+1)*13))
            myresult = mycursor.fetchall()
            myresult = list(myresult)
            values = howManyData(myresult)
            # --------------
            if myresult == []:
                return jsonify({"error": {"error": True, "message": "超過總頁數 或是 查無資料"}}), 400
            elif len(myresult) < 13:
                return jsonify({"nextPage": "null", "data": values}), 200
            else:
                values.pop(12)
                return jsonify({"nextPage": page+1, "data": values}), 200
    # -------------
    except:
        return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
    finally:
        connection_objt.close()


# ==========================================================================app.run
    # app.add_url_rule('/api/attraction/<id>',
    #                  endpoint="attractions/<id>", view_func=attraction)
    # app.add_url_rule('/api/attractions', endpoint="attractions",
    #                  view_func=attractions)

# ===================================================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3000, debug=True)
