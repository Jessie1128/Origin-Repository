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
    dataRead = open('data/taipei-attractions.json',
                    mode='r', encoding='utf8').read()
    dataLoads = json.loads(dataRead)
    data = dataLoads['result']['results']

    dataLens = (len(data))
    for num in range(dataLens):
        Url = []
        dataUrl = data[num]["file"].lower()
        dataSplitHTTP = dataUrl.split("https")
        for x in range(len(dataSplitHTTP)):
            if dataSplitHTTP[x].endswith('jpg') == True:
                Url.append("https"+dataSplitHTTP[x])
        replaceUrl = str(Url).replace("'", " ")
        newUrl = replaceUrl.strip('[]')
        imagesValues = {'images': newUrl}
        data[num].update(imagesValues)
        del data[num]["file"]

    datakeys = list(data[0].keys())
    datakeys = str(datakeys)
    datakeys = datakeys.replace("'", "").replace("[", "(").replace("]", ")")

    for num in range(dataLens):
        dataValues = list(data[num].values())
        # insertMysql = '''INSERT INTO `ATTRACTIONS`
        #         (info ,  stitle ,  xpostDate ,  longitude ,  REF_WP ,
        #         avBegin ,  langinfo ,  MRT ,  SERIAL_NO ,  RowNumber ,
        #         CAT1 ,  CAT2 ,  MEMO_TIME ,  POI ,  idpt ,  latitude ,
        #         xbody ,  _id ,  avEnd ,  address , images )
        #         VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)'''
        insertMysql = "INSERT INTO `ATTRACTIONS`"+datakeys + \
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
        mycursor.execute(insertMysql, dataValues)
        mydb.commit()
        print(mycursor.rowcount, "record inserted.")
        mydb.close()
else:
    mydb.close()
