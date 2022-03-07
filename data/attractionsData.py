import json
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv("mydb.evn")

# -----------

mydb = mysql.connector.connect(
    host="127.0.0.1", user=os.getenv("user"), password=os.getenv("password"), database="OriginRepository")
# if mydb.is_connected():
#     print("ok!")
mycursor = mydb.cursor()
# mycursor.execute("SELECT DATABASE();")
# record = mycursor.fetchone()
# print("目前使用的資料庫：", record)

# -----------
mycursor.execute("SHOW TABLES LIKE 'ATTRACTIONS';")
result = mycursor.fetchall()

if result == []:
    dataRead = open('data/taipei-attractions.json', mode='r').read()
    dataLoads = json.loads(dataRead)
    data = dataLoads['result']['results']

    for num in range(len(data)):
        Url = []
        dataUrl = data[num]["file"].lower()
        dataUrl = dataUrl.split("https")
        for x in range(len(dataUrl)):
            if dataUrl[x].endswith('jpg') == True:
                Url.append("https"+dataUrl[x])
        newUrl = str(Url).replace("'", " ").strip('[]')
        imagesValues = {'images': newUrl}
        data[num].update(imagesValues)
        del data[num]["file"]

    datakeys = list(data[0].keys())
    datakeys = str(datakeys)
    datakeys = datakeys.replace("'", "").replace("[", "(").replace("]", ")")
    datakeys = datakeys.replace("_id", "id").replace("stitle", "name").replace(
        "CAT2", "category").replace("xbody", "description").replace("info", "transport").replace("langtransport", "langinfo")

    for num in range(len(data)):
        dataValues = list(data[num].values())
        insertMysql = "INSERT INTO `ATTRACTIONS`"+datakeys +\
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
        mycursor.execute(insertMysql, dataValues)
        mydb.commit()
        print(mycursor.rowcount, num, "record inserted.")
    mydb.close()
else:
    mydb.close()
